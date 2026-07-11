package com.techlab.ecommerce.controller.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioListResponse {
  private long total;
  private List<UsuarioDTO> usuarios;
}
