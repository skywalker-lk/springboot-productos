package com.techlab.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@Profile("!test")
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthFilter;
  private final CorsConfigurationSource corsConfigurationSource;
  private final AuthenticationProvider authProvider;

  public SecurityConfig(
      JwtAuthenticationFilter jwtAuthFilter,
      CorsConfigurationSource corsConfigurationSource,
      AuthenticationProvider authProvider) {
    this.jwtAuthFilter = jwtAuthFilter;
    this.corsConfigurationSource = corsConfigurationSource;
    this.authProvider = authProvider;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource))
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth
                    // ═══════════════════════════════════════════════
                    // Públicas (sin autenticación)
                    // ═══════════════════════════════════════════════
                    .requestMatchers("/auth/**")
                    .permitAll()
                    .requestMatchers("/carrito/**")
                    .authenticated()
                    .requestMatchers("/notificaciones/**")
                    .permitAll()
                    .requestMatchers(
                        "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**")
                    .permitAll()
                    .requestMatchers("/h2-console/**")
                    .permitAll()
                    .requestMatchers("/actuator/**")
                    .permitAll()
                    .requestMatchers("/uploads/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/contacto/**")
                    .permitAll()

                    // ═══════════════════════════════════════════════
                    // Productos — GET público, POST/PUT/DELETE por rol
                    // ═══════════════════════════════════════════════
                    .requestMatchers(HttpMethod.GET, "/productos/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/productos/**")
                    .hasAnyRole("ADMINISTRADOR", "INVENTORISTA", "USUARIO_CARGA", "GERENTE")
                    .requestMatchers(HttpMethod.PUT, "/productos/**")
                    .hasAnyRole("ADMINISTRADOR", "INVENTORISTA", "GERENTE")
                    .requestMatchers(HttpMethod.DELETE, "/productos/**")
                    .hasAnyRole("ADMINISTRADOR", "INVENTORISTA", "GERENTE")

                    // ═══════════════════════════════════════════════
                    // Categorías — GET público, POST/PUT/DELETE por rol
                    // ═══════════════════════════════════════════════
                    .requestMatchers(HttpMethod.GET, "/categorias/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/categorias/**")
                    .hasAnyRole("ADMINISTRADOR", "INVENTORISTA", "GERENTE")
                    .requestMatchers(HttpMethod.PUT, "/categorias/**")
                    .hasAnyRole("ADMINISTRADOR", "INVENTORISTA", "GERENTE")
                    .requestMatchers(HttpMethod.DELETE, "/categorias/**")
                    .hasAnyRole("ADMINISTRADOR", "INVENTORISTA", "GERENTE")

                    // ═══════════════════════════════════════════════
                    // Roles
                    // ═══════════════════════════════════════════════
                    .requestMatchers(HttpMethod.GET, "/roles/**")
                    .permitAll()
                    .requestMatchers("/roles/**")
                    .hasAnyRole("ADMINISTRADOR", "GERENTE")

                    // ═══════════════════════════════════════════════
                    // Pedidos — por método y ruta específica
                    // ═══════════════════════════════════════════════
                    .requestMatchers(HttpMethod.GET, "/pedidos/mis-pedidos")
                    .hasAnyRole("CLIENTE", "VENTAS", "GERENTE", "ADMINISTRADOR")
                    .requestMatchers(HttpMethod.GET, "/pedidos/**")
                    .hasAnyRole("VENTAS", "GERENTE", "ADMINISTRADOR", "ANALISTA")
                    .requestMatchers(HttpMethod.POST, "/pedidos/**")
                    .hasAnyRole("VENTAS", "GERENTE", "ADMINISTRADOR")
                    .requestMatchers(HttpMethod.PUT, "/pedidos/**")
                    .hasAnyRole("GERENTE", "ADMINISTRADOR")
                    .requestMatchers(HttpMethod.DELETE, "/pedidos/**")
                    .hasAnyRole("GERENTE", "ADMINISTRADOR")

                    // ═══════════════════════════════════════════════
                    // Cupones
                    // ═══════════════════════════════════════════════
                    .requestMatchers(HttpMethod.POST, "/cupones/validar")
                    .hasAnyRole("CLIENTE", "GERENTE", "ADMINISTRADOR")
                    .requestMatchers("/cupones/**")
                    .hasAnyRole("GERENTE", "ADMINISTRADOR")

                    // ═══════════════════════════════════════════════
                    // Usuarios, Reportes, Dashboard
                    // ═══════════════════════════════════════════════
                    .requestMatchers("/usuarios/**")
                    .hasAnyRole("GERENTE", "ADMINISTRADOR")
                    .requestMatchers("/reportes/**")
                    .hasAnyRole("ANALISTA", "GERENTE", "ADMINISTRADOR")
                    .requestMatchers("/dashboard/**")
                    .hasAnyRole("GERENTE", "ADMINISTRADOR")

                    // ═══════════════════════════════════════════════
                    // Stock
                    // ═══════════════════════════════════════════════
                    .requestMatchers("/stock/**")
                    .hasAnyRole("INVENTORISTA", "GERENTE", "ADMINISTRADOR")

                    // ═══════════════════════════════════════════════
                    // Webhooks y Auditoría
                    // ═══════════════════════════════════════════════
                    .requestMatchers("/webhooks/**")
                    .hasAnyRole("GERENTE", "ADMINISTRADOR")
                    .requestMatchers("/auditoria/**")
                    .hasAnyRole("GERENTE", "ADMINISTRADOR")

                    // ═══════════════════════════════════════════════
                    // Contacto — POST público, listado solo admin
                    // ═══════════════════════════════════════════════
                    .requestMatchers(HttpMethod.GET, "/contacto/**")
                    .hasAnyRole("GERENTE", "ADMINISTRADOR")
                    .requestMatchers(HttpMethod.PUT, "/contacto/**")
                    .hasAnyRole("GERENTE", "ADMINISTRADOR")

                    // ═══════════════════════════════════════════════
                    // Todo lo demás (auth/me, etc.)
                    // ═══════════════════════════════════════════════
                    .anyRequest()
                    .authenticated())
        .authenticationProvider(authProvider)
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
