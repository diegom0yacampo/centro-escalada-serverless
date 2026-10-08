# Vértice Rocódromo · Misión Serverless

Web de un centro de escalada (temática asignada: **Centro de escalada**) con un formulario de nombre y email conectado a una arquitectura serverless en AWS.

Alumno: Diego Moya Campo · Grupo 2SI

## Arquitectura

```
Web (GitHub Pages / Amazon S3)
        │  fetch POST (JSON)
        ▼
API Gateway  POST /contact-02
        ▼
Lambda  ebook-contact-02 (Node.js, AWS SDK v3)
        ├─▶ DynamoDB  ContactMessages   (guarda la solicitud)
        └─▶ SNS       EbookRequests     (envía la notificación por email)
```

## URL del proyecto

| Elemento | URL |
|---|---|
| Web en GitHub Pages | https://diegom0yacampo.github.io/centro-escalada-serverless/ |
| Web en Amazon S3 | http://vertice-rocodromo-moya.s3-website-us-east-1.amazonaws.com |
| Endpoint de API Gateway | https://y1uuk8797g.execute-api.us-east-1.amazonaws.com/dev/contact-02 |

## Estructura

```
index.html        Página principal
css/styles.css    Estilos (responsive)
js/api.js         Envío del formulario a API Gateway
lambda/index.mjs  Código de la función Lambda (copia del código desplegado)
```

## Cómo se prueba

1. Abrir la web y rellenar el formulario de sesión de prueba.
2. Comprobar en DynamoDB (`ContactMessages` → Explorar elementos) que aparece un item nuevo.
3. Comprobar que llega el email de SNS con los mismos datos.

## Seguridad

Este repositorio no contiene credenciales de AWS. La Lambda usa los permisos de su Execution Role (`LabRole`), nunca claves escritas en el código. El ARN del topic y la URL de la API identifican recursos, pero no dan acceso a la cuenta.
