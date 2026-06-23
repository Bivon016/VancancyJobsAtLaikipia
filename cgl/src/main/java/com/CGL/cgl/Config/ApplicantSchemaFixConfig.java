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
            }
        };
    }

    private void dropGeneratedApplicantChecks(Connection connection) throws Exception {
        String sql = """
                SELECT CONSTRAINT_NAME
                FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'applicants'
                  AND CONSTRAINT_TYPE = 'CHECK'
                """;

        try (PreparedStatement ps = connection.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
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

    private boolean tableExists(Connection connection, String tableName) throws Exception {
        try (ResultSet rs = connection.getMetaData()
                .getTables(connection.getCatalog(), null, tableName, null)) {
            return rs.next();
        }
    }
}
