package com.techlab.ecommerce.util;

import com.techlab.ecommerce.exception.StockInsuficienteException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.InputMismatchException;
import java.util.Scanner;

/**
 * Clase utilitaria con métodos de validación reutilizables. Todos los métodos son estáticos: no
 * necesitamos crear una instancia de Validador para usarlos. Se invocan directamente con
 * Validador.validarPrecio(...), Validador.leerEntero(...), etc. Separar las validaciones en su
 * propia clase mantiene al ProductoService enfocado en la lógica de negocio y al menú enfocado en
 * la interacción con el usuario.
 */
public class Validador {

  // ----------------------------------------------------------------
  // Validaciones de datos del producto
  // ----------------------------------------------------------------
  // Estos métodos lanzan excepción si el dato es inválido.
  // No retornan nada: si terminan sin lanzar excepción, el dato
  // es válido. Es un patrón común para validaciones.

  public static void validarNombre(String nombre) {
    if (nombre == null || nombre.trim().isEmpty()) {
      throw new IllegalArgumentException("El nombre no puede estar vacío.");
    }
  }

  public static void validarPrecio(BigDecimal precio) {
    if (precio == null || precio.compareTo(BigDecimal.ZERO) < 0) {
      throw new IllegalArgumentException("El precio no puede ser negativo.");
    }
  }

  public static void validarStock(Integer stock) {
    if (stock == null || stock < 0) {
      throw new StockInsuficienteException("El stock no puede ser negativo.");
    }
  }

  // ----------------------------------------------------------------
  // Lectura segura desde consola
  // ----------------------------------------------------------------

  public static int leerEntero(Scanner sc, String mensaje) {
    while (true) {
      System.out.print(mensaje);
      try {
        int valor = sc.nextInt();
        sc.nextLine();
        return valor;
      } catch (InputMismatchException e) {
        System.out.println(" Debe ingresar un número entero. Intente nuevamente.");
        sc.nextLine();
      }
    }
  }

  public static double leerDouble(Scanner sc, String mensaje) {
    while (true) {
      System.out.print(mensaje);
      try {
        double valor = sc.nextDouble();
        sc.nextLine();
        return valor;
      } catch (InputMismatchException e) {
        System.out.println(
            "Debe ingresar un número (puede usar coma o punto). Intente nuevamente.");
        sc.nextLine();
      }
    }
  }

  public static String leerTexto(Scanner sc, String mensaje) {
    System.out.print(mensaje);
    return sc.nextLine();
  }

  public static LocalDate leerFecha(Scanner sc, String mensaje) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    while (true) {
      System.out.print(mensaje);
      try {
        String fechaStr = sc.nextLine();
        return LocalDate.parse(fechaStr, formatter);
      } catch (DateTimeParseException e) {
        System.out.println(
            "Debe ingresar una fecha valida en formato dd/mm/yyyy. Intente nuevamente por favor.");
      }
    }
  }
}
