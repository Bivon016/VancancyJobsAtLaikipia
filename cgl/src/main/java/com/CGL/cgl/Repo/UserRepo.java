package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
    List<Users> findAllByOrderByFNameAscLNameAsc();
    List<Users> findByRoleInOrderByFNameAscLNameAsc(Collection<Role> roles);
}
