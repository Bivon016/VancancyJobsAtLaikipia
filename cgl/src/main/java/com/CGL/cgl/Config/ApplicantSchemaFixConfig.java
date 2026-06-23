package com.CGL.cgl.Config;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import javax.sql.DataSource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicantSchemaFixConfig {

    @Bean
    public CommandLineRunner applicantSchemaFixRunner(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                if (!tableExists(connection, "applicants")) {
                    return;
                }

                dropGeneratedApplicantChecks(connection);
                fixApplicationsApplicantForeignKey(connection);
            }
        };
    }

    private void dropGeneratedApplicantChecks(Connection connection)
        throws Exception {
        String sql = """
            SELECT CONSTRAINT_NAME
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'applicants'
              AND CONSTRAINT_TYPE = 'CHECK'
            """;

        try (
            PreparedStatement ps = connection.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()
        ) {
            while (rs.next()) {
                String constraintName = rs.getString("CONSTRAINT_NAME");
                try (Statement statement = connection.createStatement()) {
                    statement.executeUpdate(
                        "ALTER TABLE applicants DROP CHECK " + constraintName
                    );
                }
            }
        }
    }

    private void fixApplicationsApplicantForeignKey(Connection connection)
        throws Exception {
        if (
            !tableExists(connection, "applications") ||
            !columnExists(connection, "applications", "applicant_id")
        ) {
            return;
        }

        boolean hasCorrectForeignKey = false;

        String sql = """
            SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'applications'
              AND COLUMN_NAME = 'applicant_id'
              AND REFERENCED_TABLE_NAME IS NOT NULL
            """;

        try (
            PreparedStatement ps = connection.prepareStatement(sql);
            ResultSet rs = ps.executeQuery()
        ) {
            while (rs.next()) {
                String constraintName = rs.getString("CONSTRAINT_NAME");
                String referencedTableName = rs.getString(
                    "REFERENCED_TABLE_NAME"
                );

                if ("applicants".equalsIgnoreCase(referencedTableName)) {
                    hasCorrectForeignKey = true;
                    continue;
                }

                try (Statement statement = connection.createStatement()) {
                    statement.executeUpdate(
                        "ALTER TABLE applications DROP FOREIGN KEY " +
                            constraintName
                    );
                }
            }
        }

        if (!hasCorrectForeignKey) {
            try (Statement statement = connection.createStatement()) {
                statement.executeUpdate(
                    "ALTER TABLE applications " +
                        "ADD CONSTRAINT fk_applications_applicant " +
                        "FOREIGN KEY (applicant_id) REFERENCES applicants(id)"
                );
            }
        }
    }

    private boolean tableExists(Connection connection, String tableName)
        throws Exception {
        try (
            ResultSet rs = connection
                .getMetaData()
                .getTables(connection.getCatalog(), null, tableName, null)
        ) {
            return rs.next();
        }
    }

    private boolean columnExists(
        Connection connection,
        String tableName,
        String columnName
    ) throws Exception {
        try (
            ResultSet rs = connection
                .getMetaData()
                .getColumns(
                    connection.getCatalog(),
                    null,
                    tableName,
                    columnName
                )
        ) {
            return rs.next();
        }
    }
}
