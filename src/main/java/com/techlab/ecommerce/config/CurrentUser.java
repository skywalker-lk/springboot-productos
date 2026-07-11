package com.techlab.ecommerce.config;

public class CurrentUser {

  private static final ThreadLocal<UserInfo> HOLDER = new ThreadLocal<>();

  public static void set(UserInfo user) {
    HOLDER.set(user);
  }

  public static UserInfo get() {
    return HOLDER.get();
  }

  public static void clear() {
    HOLDER.remove();
  }

  public static class UserInfo {
    private final Integer id;
    private final String nombre;
    private final String endpoint;
    private final String method;

    public UserInfo(Integer id, String nombre, String endpoint, String method) {
      this.id = id;
      this.nombre = nombre;
      this.endpoint = endpoint;
      this.method = method;
    }

    public Integer getId() {
      return id;
    }

    public String getNombre() {
      return nombre;
    }

    public String getEndpoint() {
      return endpoint;
    }

    public String getMethod() {
      return method;
    }
  }
}
