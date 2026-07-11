package com.techlab.ecommerce.config;

import com.techlab.ecommerce.model.categorias.Categoria;
import com.techlab.ecommerce.model.cupon.Cupon;
import com.techlab.ecommerce.model.cupon.TipoDescuento;
import com.techlab.ecommerce.model.productos.Bebida;
import com.techlab.ecommerce.model.productos.Comida;
import com.techlab.ecommerce.model.roles.RolUsuario;
import com.techlab.ecommerce.model.usuarios.Cliente;
import com.techlab.ecommerce.model.usuarios.Usuario;
import com.techlab.ecommerce.repository.CategoriaRepository;
import com.techlab.ecommerce.repository.CuponRepository;
import com.techlab.ecommerce.repository.UsuarioRepository;
import com.techlab.ecommerce.service.ProductoService;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class CargaDatosConfig {

  @Bean
  public CommandLineRunner cargarDatos(
      CategoriaRepository categoriaRepository,
      ProductoService service,
      UsuarioRepository usuarioRepository,
      PasswordEncoder passwordEncoder,
      CuponRepository cuponRepository) {
    return args -> {
      // ─── Categorías y productos (una sola vez) ────────────
      if (categoriaRepository.count() == 0) {
        Categoria bebidas =
            categoriaRepository.save(new Categoria("BEBIDAS", "Bebidas", "Bebidas en general"));
        Categoria almacen =
            categoriaRepository.save(new Categoria("ALMACEN", "Almacén", "Productos de almacén"));
        Categoria golosinas =
            categoriaRepository.save(new Categoria("GOLOSINAS", "Golosinas", "Golosinas y snacks"));

        service.guardar(
            new Bebida("Café molido 500g", BigDecimal.valueOf(4500), 30, bebidas, 0.5f));
        service.guardar(new Bebida("Yerba mate 1kg", BigDecimal.valueOf(3200), 50, bebidas, 1.0f));
        service.guardar(
            new Comida("Galletitas dulces", BigDecimal.valueOf(1850), 100, almacen, 200));
        service.guardar(
            new Comida("Aceite de oliva 500ml", BigDecimal.valueOf(6700), 20, almacen, 500));
        service.guardar(
            new Comida("Chocolate amargo 70%", BigDecimal.valueOf(2900), 15, golosinas, 100));
      }

      // ─── Usuarios por rol (siempre, si faltan) ────────────
      // Se ejecuta en cada restart para asegurar que haya un usuario por rol
      for (RolUsuario rol : RolUsuario.values()) {
        String email = rol.name().toLowerCase() + "@test.com";
        if (!usuarioRepository.existsByEmail(email)) {
          String nombre = capitalizar(rol.name());
          Usuario usuario;
          if (rol == RolUsuario.CLIENTE) {
            usuario = new Cliente(nombre, "", email, passwordEncoder.encode("123456"), "", rol);
          } else {
            usuario = new Usuario(nombre, "", email, passwordEncoder.encode("123456"), "", rol);
          }
          usuarioRepository.save(usuario);
        }
      }

      // ─── Cupones de descuento (una sola vez) ───────────────
      if (cuponRepository.count() == 0) {
        cuponRepository.save(
            new Cupon("DESC10", TipoDescuento.PORCENTAJE, BigDecimal.valueOf(10), 100));
        cuponRepository.save(
            new Cupon("DESC20", TipoDescuento.PORCENTAJE, BigDecimal.valueOf(20), 50));
        cuponRepository.save(
            new Cupon("DESC500", TipoDescuento.MONTO_FIJO, BigDecimal.valueOf(500), 30));
        Cupon cupon1500 =
            new Cupon("DESC1500", TipoDescuento.MONTO_FIJO, BigDecimal.valueOf(1500), 10);
        cupon1500.setMontoMinimo(BigDecimal.valueOf(10000));
        cupon1500.setFechaExpiracion(LocalDate.now().plusMonths(1));
        cuponRepository.save(cupon1500);
      }
    };
  }

  private static String capitalizar(String input) {
    if (input == null || input.isEmpty()) return input;
    String lower = input.toLowerCase();
    return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
  }
}
