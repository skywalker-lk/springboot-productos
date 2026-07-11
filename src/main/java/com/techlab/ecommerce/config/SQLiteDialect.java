package com.techlab.ecommerce.config;

/**
 * SQLiteDialect no se usa actualmente en el flujo de Docker/PostgreSQL.
 *
 * <p>La razón por la que existió es que Hibernate necesita un "dialecto" para traducir tipos
 * Java/SQL a la sintaxis específica de la base de datos. En Hibernate 6 esa API cambió, y la clase
 * que había aquí estaba obsoleta.
 *
 * <p>Si en algún momento querés volver a usar SQLite, esta clase debe implementarse con la API
 * actual de Dialect de Hibernate 6.
 */
public class SQLiteDialect {}
