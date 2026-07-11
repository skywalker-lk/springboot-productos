package com.techlab.ecommerce.service;

import com.techlab.ecommerce.model.webhook.Webhook;
import com.techlab.ecommerce.repository.WebhookRepository;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
public class WebhookService {

  private static final Logger log = LoggerFactory.getLogger(WebhookService.class);

  private final WebhookRepository repository;
  private final RestTemplate restTemplate;

  public WebhookService(WebhookRepository repository, RestTemplate restTemplate) {
    this.repository = repository;
    this.restTemplate = restTemplate;
  }

  public List<Webhook> listar() {
    return repository.findAll();
  }

  public Webhook crear(String url, String evento) {
    return repository.save(new Webhook(url, evento));
  }

  public Webhook actualizar(int id, String url, String evento, boolean activo) {
    Webhook w =
        repository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("Webhook no encontrado: " + id));
    w.setUrl(url);
    w.setEvento(evento);
    w.setActivo(activo);
    return repository.save(w);
  }

  @Transactional
  public void eliminar(int id) {
    repository.deleteById(id);
  }

  public void disparar(String evento, Map<String, Object> datos) {
    List<Webhook> hooks = repository.findByEventoAndActivoTrue(evento);
    for (Webhook hook : hooks) {
      try {
        Map<String, Object> payload =
            Map.of(
                "evento", evento,
                "timestamp", System.currentTimeMillis(),
                "datos", datos);
        restTemplate.postForEntity(hook.getUrl(), payload, String.class);
        log.info("Webhook {} enviado a {}", evento, hook.getUrl());
      } catch (Exception e) {
        log.error("Error enviando webhook {} a {}: {}", evento, hook.getUrl(), e.getMessage());
      }
    }
  }
}
