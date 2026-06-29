package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.EmailVerificationToken;
import com.CGL.cgl.Model.Users;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailVerificationTokenRepo
    extends JpaRepository<EmailVerificationToken, Long>
{
    Optional<EmailVerificationToken> findByUser(Users user);
    Optional<EmailVerificationToken> findByUserAndCode(Users user, String code);
    void deleteByUser(Users user);
}
