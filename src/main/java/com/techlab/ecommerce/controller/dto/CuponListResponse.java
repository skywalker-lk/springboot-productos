package com.techlab.ecommerce.controller.dto;

import com.techlab.ecommerce.model.cupon.Cupon;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CuponListResponse {
  private long total;
  private List<Cupon> cupones;
}
