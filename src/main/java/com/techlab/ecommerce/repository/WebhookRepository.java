package com.techlab.ecommerce.repository;

import com.techlab.ecommerce.model.webhook.Webhook;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WebhookRepository extends JpaRepository<Webhook, Integer> {
  List<Webhook> findByEventoAndActivoTrue(String evento);
}
