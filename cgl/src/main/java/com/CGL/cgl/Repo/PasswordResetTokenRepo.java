package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.PasswordResetToken;
import com.CGL.cgl.Model.Users;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepo
    extends JpaRepository<PasswordResetToken, Long>
{
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(Users user);
    void deleteByUser(Users user);
}
