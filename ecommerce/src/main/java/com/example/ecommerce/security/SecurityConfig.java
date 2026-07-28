package com.example.ecommerce.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.http.HttpMethod;

import java.util.List;

@Configuration
@EnableMethodSecurity // ✅ Needed for @PreAuthorize (if used)
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtFilter jwtFilter, UserDetailsService userDetailsService) {
        this.jwtFilter = jwtFilter;
        this.userDetailsService = userDetailsService;
    }

    // Authentication provider
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // Authentication manager
    @Bean
    public AuthenticationManager authManager() {
        return new ProviderManager(authenticationProvider());
    }

    // Password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Security filter chain
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Disable CSRF (for REST API)
                .csrf(csrf -> csrf.disable())

                // CORS configuration for React frontend
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of(
        "http://localhost:3000",
        "https://easybuy-ecommerce-phi.vercel.app",
        "https://easybuy-ecommerce-git-main-sushmithatns-projects.vercel.app"
));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))

                // Request authorization
               .authorizeHttpRequests(auth -> auth

        .requestMatchers("/api/auth/**").permitAll()

        .requestMatchers(
                HttpMethod.GET,
                "/api/products",
                "/api/products/**"
        ).permitAll()

        .requestMatchers(
                HttpMethod.GET,
                "/api/categories",
                "/api/categories/**"
        ).permitAll()

        .requestMatchers("/images/**").permitAll()


        .requestMatchers("/api/users/**").authenticated()
        .requestMatchers("/api/cart/**").authenticated()
        .requestMatchers("/api/wishlist/**").authenticated()
        .requestMatchers("/api/orders/**").authenticated()
        .requestMatchers("/api/reviews/**").authenticated()
        .requestMatchers("/api/coupons/**").authenticated()


        .anyRequest().authenticated()
)

                // Stateless session (JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Add JWT filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
