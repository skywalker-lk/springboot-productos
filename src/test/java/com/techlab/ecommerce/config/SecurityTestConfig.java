package com.techlab.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de seguridad para el perfil "test".
 *
 * <p>Desactiva TODA autenticación (permitAll en todas las rutas) para que los tests de integración
 * existentes sigan funcionando sin necesidad de enviar tokens JWT.
 *
 * <p>Los tests que quieran probar autenticación pueden hacerlo enviando el header Authorization:
 * Bearer manualmente; el JwtAuthenticationFilter se ejecuta igual y setea el SecurityContext si el
 * token es válido.
 */
@Configuration
@EnableWebSecurity
@Profile("test")
public class SecurityTestConfig {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

    return http.build();
  }
}
