package com.example.hms.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;

    @Value("${app.cors.allowed-origins:http://localhost:*}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          CustomUserDetailsService userDetailsService,
                          RestAuthenticationEntryPoint authenticationEntryPoint,
                          RestAccessDeniedHandler accessDeniedHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
			.requestMatchers("/actuator/health").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/auth/register-staff").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        .requestMatchers("/api/patients/**").hasAnyRole("PATIENT", "ADMIN", "SUPER_ADMIN")

                        .requestMatchers("/api/appointments/**")
                        .hasAnyRole("RECEPTIONIST", "ADMIN", "DOCTOR", "NURSE", "SUPER_ADMIN")

                        .requestMatchers("/api/consultations/**")
                        .hasAnyRole("DOCTOR", "ADMIN", "NURSE", "SUPER_ADMIN")

                        .requestMatchers("/api/prescriptions/**")
                        .hasAnyRole("DOCTOR", "PHARMACIST", "RECEPTIONIST", "ADMIN", "SUPER_ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/lab/order-test")
                        .hasAnyRole("DOCTOR", "RECEPTIONIST", "ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/lab/update-status/**")
                        .hasAnyRole("LAB_TECHNICIAN", "ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/lab/upload-report/**")
                        .hasAnyRole("LAB_TECHNICIAN", "ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/lab/pending-orders")
                        .hasAnyRole("LAB_TECHNICIAN", "DOCTOR", "ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/lab/all-orders")
                        .hasAnyRole("LAB_TECHNICIAN", "DOCTOR", "ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/lab/add-doctor-notes/**")
                        .hasAnyRole("DOCTOR", "ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/lab/**")
                        .hasAnyRole("DOCTOR", "LAB_TECHNICIAN", "RECEPTIONIST", "ADMIN", "SUPER_ADMIN")

                        .requestMatchers("/api/pharmacy/**")
                        .hasAnyRole("PHARMACIST", "ADMIN", "SUPER_ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/doctors").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/doctors").permitAll()
                        .requestMatchers("/api/doctors/**").authenticated()

                        .requestMatchers("/api/bills/**", "/api/beds/**", "/api/admissions/**").authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/notifications/broadcast").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/notifications/broadcast-history").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/api/notifications/**").authenticated()

                        .requestMatchers("/api/patient-lookup/**").authenticated()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();
        configuration.setAllowedOriginPatterns(origins.isEmpty() ? List.of("http://localhost:*") : origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
