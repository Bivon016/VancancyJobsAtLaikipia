package com.CGL.cgl.Config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;
import javax.sql.DataSource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EmailVerificationSchemaFixConfig {

    @Bean
    public CommandLineRunner emailVerificationSchemaFixRunner(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                if (!tableExists(connection, "email_verification_tokens")) {
                    return;
                }

                boolean hasTokenColumn = columnExists(connection, "email_verification_tokens", "token");
                boolean hasCodeColumn = columnExists(connection, "email_verification_tokens", "code");

                try (Statement statement = connection.createStatement()) {
                    if (hasTokenColumn && !hasCodeColumn) {
                        statement.executeUpdate(
                                "ALTER TABLE email_verification_tokens CHANGE COLUMN token code VARCHAR(6) NOT NULL"
                        );
                    } else if (hasTokenColumn) {
                        statement.executeUpdate(
                                "ALTER TABLE email_verification_tokens DROP COLUMN token"
                        );
                    }
                }
            }
        };
    }

    private boolean tableExists(Connection connection, String tableName) throws Exception {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet rs = metaData.getTables(connection.getCatalog(), null, tableName, null)) {
            return rs.next();
        }
    }

    private boolean columnExists(Connection connection, String tableName, String columnName) throws Exception {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet rs = metaData.getColumns(connection.getCatalog(), null, tableName, columnName)) {
            return rs.next();
        }
    }
}
