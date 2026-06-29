package com.CGL.cgl.Repo;

import com.CGL.cgl.Model.Role;
import com.CGL.cgl.Model.Users;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<Users, Long> {
    Optional<Users> findByEmail(String email);
    @Query("SELECT u FROM Users u ORDER BY u.fName ASC, u.lName ASC")
    List<Users> findAllOrderByName();

    @Query("SELECT u FROM Users u WHERE u.role IN :roles ORDER BY u.fName ASC, u.lName ASC")
    List<Users> findByRoleInOrderByName(@Param("roles") Collection<Role> roles);
}
