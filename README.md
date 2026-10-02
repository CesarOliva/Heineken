# Simulación de máquina clasificadora de botellas de vidrio

## 1. Descripción general

El proyecto consiste en una simulación web interactiva de una máquina capaz de **recibir, analizar, contar y clasificar botellas de vidrio postconsumo**, tomando como referencia envases utilizados por HEINEKEN y otras marcas.

La máquina recibe botellas completas de cualquier marca y analiza sus características físicas y visuales. El sistema determina si el objeto corresponde a una botella de vidrio válida, identifica su color y utiliza OCR para intentar reconocer la marca.

La **separación física de las botellas se realiza exclusivamente por color o condición de rechazo/no identificación**. La marca no determina el contenedor, sino que se utiliza para generar información de conteo y trazabilidad.

El proyecto busca demostrar conceptualmente cómo una máquina de este tipo podría apoyar la **recuperación y trazabilidad de botellas postconsumo** dentro de una estrategia de logística inversa y economía circular.

---

# 2. Objetivo

Demostrar mediante una simulación interactiva que una máquina puede:

- Recibir botellas de diferentes marcas.
- Determinar si cumplen las características físicas mínimas de una botella de vidrio.
- Detectar botellas fuera de los parámetros establecidos.
- Identificar el color del vidrio.
- Intentar identificar la marca mediante OCR.
- Clasificar físicamente las botellas.
- Contabilizar las botellas recuperadas.
- Mostrar estadísticas de recuperación por color y marca.
- Registrar las características de cada botella en un archivo CSV.
- Generar información útil para la trazabilidad y análisis interno de botellas recuperadas postconsumo.

---

# 3. Alcance del MVP

## Incluido

- Simulación visual de la máquina.
- Máquina representada en **corte lateral**.
- Animación del recorrido de la botella.
- Entrada de una botella a la vez.
- Validación de presencia.
- Simulación de medición de peso.
- Simulación de medición de altura y diámetro.
- Clasificación de vidrio/no vidrio mediante reglas.
- Detección de color mediante RGB.
- Identificación de marca mediante OCR.
- Clasificación en cinco contenedores.
- Contadores en tiempo real.
- Parámetros configurables mediante controles deslizantes.
- Velocidad de simulación configurable.
- Registro de cada botella en CSV.

## Fuera del alcance inicial

- Dashboard histórico.
- Base de datos.
- Identificación individual de cada botella.
- Número de botella.
- Tiempo individual de procesamiento registrado en CSV.
- Detección avanzada de suciedad o residuos.
- Detección avanzada de deformaciones.
- Análisis espectrofotométrico.
- Reconstrucción tridimensional de la botella.
- Implementación física de la máquina.

---

# 4. Arquitectura tecnológica

La simulación estará dividida en dos componentes principales.

## 4.1. Interfaz web

Tecnologías:

- React
- TypeScript

La interfaz será responsable de:

- Representar visualmente la máquina.
- Animar el movimiento de las botellas.
- Mostrar los sensores y etapas del proceso.
- Mostrar los resultados de cada análisis.
- Mostrar contadores.
- Permitir modificar parámetros mediante controles deslizantes.
- Controlar la velocidad de simulación.
- Mostrar aceptación/rechazo.
- Representar el funcionamiento de las compuertas.
- Mostrar el estado de los contenedores.

## 4.2. Módulo de visión artificial

Tecnología:

- Python
- OpenCV
- RGB
- OCR

Este módulo **ya se encuentra implementado** y no forma parte del trabajo de reconstrucción del proyecto.

Su función es:

1. Analizar el color del vidrio mediante RGB.
2. Analizar la etiqueta.
3. Intentar identificar la marca mediante OCR.
4. Retornar los resultados a la simulación.

---

# 5. Flujo general de la máquina

```text
Botella
   ↓
Sensor de presencia
   ↓
Medición de peso
   ↓
Medición de altura y diámetro
   ↓
¿Cumple características físicas?
   ├── NO → Rechazo
   │
   └── SÍ
        ↓
   Análisis de transmisión de luz
        ↓
   ¿Es vidrio válido?
   ├── NO → Rechazo
   │
   └── SÍ
        ↓
   Identificación de color
        ↓
   OCR de etiqueta
        ↓
   Identificación de marca
        ↓
   Clasificación
        ↓
   Compuerta
        ↓
   Contenedor correspondiente
        ↓
   Registro CSV
        ↓
   Actualización de contadores
```

---

# 6. Diseño físico simulado

La máquina será representada como un **gabinete cerrado de aproximadamente 1.2 metros de altura**, mostrado en corte lateral para permitir visualizar los componentes internos.

## Componentes

### 1. Charola de entrada

El personal coloca una botella a la vez.

La botella se introduce:

- De una en una.
- Completa.
- Con el cuello hacia adelante.

Las botellas rotas no deberían ser introducidas por el personal, aunque la máquina cuenta con filtros para detectar valores anormales.

---

### 2. Sensor de presencia

Detecta que una botella ha ingresado a la máquina.

Su función es iniciar el ciclo de análisis.

```text
Sin botella → Espera
Botella detectada → Iniciar análisis
```

---

### 3. Plataforma con celda de carga

La botella se coloca sobre una plataforma equipada con una celda de carga.

La simulación obtiene:

```text
Peso = X gramos
```

El peso se compara contra los límites configurables.

---

### 4. Barrera de luz

Un único sensor/barrera de luz se utiliza para obtener las dimensiones generales de la botella.

Variables:

- Altura.
- Diámetro.

Los valores son aproximados y no representan mediciones industriales de precisión.

---

### 5. Cámara óptica

La cámara analiza la botella utilizando una fuente de luz blanca de fondo.

La medición se realiza en una zona sin etiqueta, preferentemente:

- Cuello.
- Hombro.

El sistema calcula la cantidad de luz que atraviesa el vidrio y sus componentes RGB.

---

### 6. OCR

Se analiza la etiqueta de la botella para intentar identificar la marca.

La ausencia de etiqueta no provoca automáticamente rechazo.

Si la marca no puede identificarse:

```text
marca = "No identificada"
```

La botella puede continuar siendo aceptada si cumple los demás criterios.

---

### 7. Sistema de compuertas

La botella llega al sistema de separación.

Las compuertas utilizan servomotores en la representación de la máquina.

Existen cinco destinos:

1. Verde
2. Ámbar
3. Transparente
4. No identificado
5. Rechazo

---

### 8. Caída amortiguada

La botella cae hacia su contenedor mediante una superficie o mecanismo amortiguado.

El objetivo conceptual es evitar roturas durante la separación.

---

### 9. Sensores de nivel

Cada contenedor tiene un sensor de nivel.

Cuando el nivel alcanza el límite configurado:

```text
Contenedor disponible → Estado normal
Contenedor lleno → Advertencia
```

---

### 10. Pantalla

La máquina muestra visualmente el resultado del procesamiento.

Estados principales:

- Verde → Botella aceptada.
- Rojo → Botella rechazada.
- Amarillo/advertencia → Contenedor lleno o condición que requiera atención.

También se muestran los conteos acumulados.

---

# 7. Tipos de botella

La simulación contempla tres tipos de color de vidrio:

- Verde
- Ámbar
- Transparente

El color se determina mediante análisis RGB simplificado.

La marca y el color son variables independientes.

Ejemplos:

```text
Heineken + Verde
Tecate + Ámbar
Marca no identificada + Transparente
```

---

# 8. Marcas reconocidas

El sistema OCR utiliza inicialmente el siguiente catálogo:

```python
BRANDS = [
    "Tecate",
    "Dos Equis",
    "Indio",
    "Bohemia",
    "Sol",
    "Carta Blanca",
    "Superior",
    "Amstel Ultra",
    "Heineken",
    "Coors",
    "Miller",
]
```

El catálogo deberá mantenerse como una estructura configurable.

Una marca que no se encuentre en este catálogo será considerada:

```text
No identificada
```

---

# 9. Reglas de aceptación

Las reglas son **supuestos aproximados y editables**.

Una botella debe cumplir los criterios establecidos para continuar con el proceso.

## 9.1. Dimensiones

Rango inicial:

```text
Altura:   15 – 35 cm
Diámetro:  5 – 10 cm
```

Estos valores son generales y no corresponden a un modelo específico de botella.

Los límites podrán modificarse mediante controles deslizantes.

---

## 9.2. Peso

Rango inicial:

```text
180 – 250 g
```

El rango representa una aproximación general para una botella de vidrio vacía.

Los límites podrán modificarse mediante controles deslizantes.

---

## 9.3. Transmisión de luz

La botella debe permitir cierto paso de luz.

Regla inicial:

```text
Transmisión < 3%
→ Rechazo
```

Una transmisión menor al 3% se considera demasiado opaca para el criterio simplificado de la simulación.

---

# 10. Detección de botellas rotas

No se contempla que el personal introduzca botellas rotas.

Sin embargo, la máquina incorpora un filtro para detectar valores anormales.

Una botella será considerada potencialmente rota/no válida si:

```text
Peso fuera del rango
OR
Altura fuera del rango
```

Resultado:

```text
→ Rechazo
```

No se implementará inicialmente una detección visual avanzada de roturas.

---

# 11. Clasificación de color

Se utilizarán reglas sencillas basadas en RGB.

## Transparente

La botella permite una transmisión alta y relativamente uniforme de luz.

Conceptualmente:

```text
R ≈ G ≈ B
```

con alta transmisión general.

---

## Verde

La transmisión presenta predominancia del componente verde.

Conceptualmente:

```text
G > R
G > B
```

---

## Ámbar

La transmisión presenta predominancia de componentes rojos y verdes, con menor componente azul.

Conceptualmente:

```text
R y G elevados
B reducido
```

---

## Opaco

Si:

```text
Transmisión < 3%
```

la botella se considera no válida y se envía a rechazo.

> Los umbrales exactos de RGB serán configurables y forman parte de la simulación, no de una especificación industrial.

---

# 12. Identificación de marca

El OCR intenta encontrar una coincidencia entre el texto de la etiqueta y el catálogo de marcas.

## Marca identificada

Ejemplo:

```text
OCR → "HEINEKEN"
Resultado → Heineken
```

## Marca no identificada

Puede ocurrir cuando:

- No existe etiqueta.
- La etiqueta está ilegible.
- El OCR no obtiene texto suficiente.
- La marca no pertenece al catálogo.
- La lectura no coincide con una marca conocida.

Resultado:

```text
Marca = "No identificada"
```

La botella **no es rechazada automáticamente**.

---

# 13. Regla de separación

La marca **NO determina el contenedor físico**.

El color sí determina la separación de una botella identificada.

Ejemplo:

```text
Heineken + Verde
→ Contenedor Verde

Tecate + Verde
→ Contenedor Verde

Marca no identificada + Verde
→ Contenedor No identificado
```

Esto permite mantener separados dos conceptos:

### Información

```text
Marca + Color + Características físicas
```

### Separación física

```text
Color / No identificado / Rechazo
```

---

# 14. Contenedores

La máquina tendrá cinco contenedores.

| Contenedor | Condición |
|---|---|
| Verde | Vidrio válido, color verde y marca identificada |
| Ámbar | Vidrio válido, color ámbar y marca identificada |
| Transparente | Vidrio válido, color transparente y marca identificada |
| No identificado | Vidrio válido pero marca no identificada |
| Rechazo | Botella que no cumple los criterios físicos o de vidrio |

### Nota sobre "No identificado"

Una botella sin etiqueta o cuyo OCR no encuentre una coincidencia será enviada al contenedor **No identificado**, independientemente de su color.

Ejemplo:

```text
Botella transparente
+
Sin etiqueta
=
No identificado
```

El color seguirá registrándose en el CSV.

---

# 15. Conteo

La interfaz mostrará conteos acumulados en tiempo real.

## Conteo por color

```text
Verde:        25
Ámbar:        31
Transparente: 12
```

## Conteo por marca

```text
Heineken:      18
Tecate:          9
Dos Equis:       7
Indio:           6
Bohemia:         4
...
No identificada: 24
```

## Conteo total

```text
Botellas recibidas: 68
Botellas aceptadas: 64
Botellas rechazadas: 4
```

## Botellas recuperadas

Para el propósito de la simulación:

```text
Botellas recuperadas =
botellas aceptadas como vidrio
```

---

# 16. Registro CSV

Cada botella procesada generará un registro.

Campos iniciales:

```text
timestamp
marca
color
altura
diametro
peso
transmitancia
decision
motivo_rechazo
contenedor
```

Ejemplo:

```csv
timestamp,marca,color,altura,diametro,peso,transmitancia,decision,motivo_rechazo,contenedor
2026-10-02T15:30:12,Heineken,Verde,23.4,6.2,221,48.3,Aceptada,,Verde
2026-10-02T15:30:20,Tecate,Ambar,25.1,6.5,230,31.7,Aceptada,,Ambar
2026-10-02T15:30:28,No identificada,Transparente,24.8,6.3,218,82.1,Aceptada,,No identificado
2026-10-02T15:30:36,Heineken,Verde,40.2,6.1,230,45.2,Rechazada,Altura fuera de rango,Rechazo
```

No se registrará:

- Número de botella.
- Identificador individual.
- Tiempo individual de procesamiento.

---

# 17. Animación

La máquina deberá representarse como un sistema animado.

El recorrido conceptual será:

```text
Entrada
  ↓
Presencia
  ↓
Peso
  ↓
Dimensiones
  ↓
Transmisión de luz
  ↓
Cámara
  ↓
OCR
  ↓
Decisión
  ↓
Compuerta
  ↓
Contenedor
```

La botella deberá desplazarse visualmente por cada etapa.

Cada etapa podrá mostrar su estado:

```text
Pendiente
Procesando
Correcto
Rechazado
```

---

# 18. Velocidad de simulación

El tiempo de procesamiento conceptual de una botella es:

```text
8 segundos
```

Sin embargo, la velocidad será modificable desde la interfaz.

El usuario podrá acelerar o reducir la simulación sin modificar las reglas de clasificación.

Ejemplo conceptual:

```text
Velocidad 0.5x → proceso lento
Velocidad 1x   → velocidad normal
Velocidad 2x   → proceso acelerado
Velocidad 5x   → demostración rápida
```

La velocidad solamente afecta la animación y el flujo temporal de la simulación.

---

# 19. Parámetros editables

Los límites utilizados por la máquina serán configurables mediante controles deslizantes.

## Parámetros físicos

```text
Altura mínima
Altura máxima

Diámetro mínimo
Diámetro máximo

Peso mínimo
Peso máximo
```

## Parámetros ópticos

```text
Transmisión mínima
```

## Parámetros de color

Los umbrales RGB podrán modificarse para experimentar con la clasificación.

## Parámetros de simulación

```text
Velocidad
```

Esto permitirá demostrar cómo cambia la clasificación cuando se modifican los criterios.

---

# 20. Lógica general de decisión

Pseudocódigo:

```text
recibir botella

detectar presencia

medir peso
medir altura
medir diámetro

SI peso fuera de rango:
    rechazar

SI altura fuera de rango:
    rechazar

analizar transmisión de luz

SI transmisión < mínimo:
    rechazar

determinar color

realizar OCR

SI OCR encuentra marca:
    marca = marca reconocida
SINO:
    marca = "No identificada"

SI marca == "No identificada":
    contenedor = "No identificado"
SINO SI color == "Verde":
    contenedor = "Verde"
SINO SI color == "Ámbar":
    contenedor = "Ámbar"
SINO SI color == "Transparente":
    contenedor = "Transparente"

registrar información

actualizar contadores

activar compuerta

enviar botella al contenedor

mostrar resultado
```

---

# 21. Arquitectura conceptual de datos

Una botella procesada puede representarse como:

```typescript
interface BottleResult {
  timestamp: string;
  brand: string;
  color: "verde" | "ambar" | "transparente";
  height: number;
  diameter: number;
  weight: number;
  lightTransmission: number;
  decision: "accepted" | "rejected";
  rejectionReason?: string;
  container:
    | "verde"
    | "ambar"
    | "transparente"
    | "no-identificado"
    | "rechazo";
}
```

La estructura podrá evolucionar durante la implementación.

---

# 22. Estados de la máquina

La máquina puede modelarse mediante estados:

```text
IDLE
↓
BOTTLE_DETECTED
↓
WEIGHING
↓
MEASURING
↓
GLASS_ANALYSIS
↓
COLOR_ANALYSIS
↓
OCR_ANALYSIS
↓
DECISION
↓
DIVERTING
↓
DROP
↓
REGISTERING
↓
IDLE
```

En caso de rechazo:

```text
DECISION
↓
REJECTING
↓
DIVERTING_TO_REJECT
↓
DROP
↓
REGISTERING
↓
IDLE
```

---

# 23. Problema que busca resolver

Actualmente, la recuperación de envases postconsumo depende de que los consumidores separen y entreguen correctamente los envases y de que posteriormente exista una cadena logística capaz de recuperar, clasificar y procesar dichos materiales.

La propuesta busca representar un punto automatizado de recuperación que pueda:

- Facilitar la recepción de botellas.
- Automatizar la clasificación inicial.
- Separar físicamente diferentes tipos de vidrio.
- Identificar marcas cuando sea posible.
- Generar información estructurada.
- Facilitar la trazabilidad.
- Obtener datos sobre el volumen y composición de las botellas recuperadas.

---

# 24. Aplicación potencial para HEINEKEN

El objetivo no es únicamente separar residuos.

La información generada podría utilizarse para conocer:

- Cantidad de botellas recuperadas.
- Distribución por color.
- Distribución por marca.
- Cantidad de botellas no identificadas.
- Cantidad de botellas rechazadas.
- Características físicas de los envases recuperados.
- Evolución de recuperación en diferentes puntos.
- Composición del flujo postconsumo.

Esta información podría posteriormente utilizarse para apoyar decisiones relacionadas con:

- Logística inversa.
- Reutilización.
- Reciclaje.
- Planeación de recolección.
- Trazabilidad.
- Optimización de puntos de recuperación.
- Economía circular.

---

# 25. Limitaciones de la simulación

La simulación representa un modelo conceptual y no una especificación industrial.

Entre sus principales limitaciones:

- Los rangos físicos son aproximados.
- La identificación de color mediante RGB es simplificada.
- La medición de dimensiones se representa mediante un único sensor.
- No se considera suciedad.
- No se consideran residuos líquidos.
- No se consideran deformaciones.
- La detección de roturas es indirecta.
- El OCR puede fallar.
- No se realiza identificación individual de cada botella.
- No existe una base de datos en el MVP.
- No existe un dashboard histórico.
- No se realiza todavía una decisión real de reutilización frente a reciclaje.
- No se calcula todavía el impacto ambiental o económico real.

---

# 26. Áreas de mejora futuras

## Dashboard

Implementar un dashboard histórico para consultar:

- Recuperación por día.
- Recuperación por establecimiento.
- Recuperación por marca.
- Recuperación por color.
- Rechazos.
- Botellas no identificadas.
- Tendencias.

## Base de datos

Sustituir o complementar el CSV con una base de datos para permitir análisis histórico y centralizado.

## Trazabilidad

Agregar identificadores, lotes o información de origen cuando sea viable.

## Visión artificial

Mejorar:

- Detección de roturas.
- Reconocimiento de formas.
- Identificación de suciedad.
- Identificación de deformaciones.
- Clasificación de color.
- OCR.

## Clasificación avanzada

Relacionar:

```text
Marca + modelo de botella + color + dimensiones
```

para determinar posteriormente si un envase pertenece a un circuito específico de reutilización.

## Logística inversa

Utilizar los datos de recuperación para determinar:

- Cuándo recoger los contenedores.
- Qué puntos generan mayor volumen.
- Qué rutas son más eficientes.
- Cuántas botellas pueden recuperarse por periodo.

## Integración con economía circular

En una etapa posterior, el sistema podría distinguir entre:

```text
Botella recuperada
        ↓
¿Apta para reutilización?
    ├── Sí → circuito de reutilización
    └── No → circuito de reciclaje
```

Esta decisión requeriría criterios industriales adicionales que no forman parte del MVP.

---

# 27. Criterios de éxito del MVP

La simulación se considerará funcional cuando sea capaz de:

1. Recibir una botella simulada.
2. Ejecutar el recorrido completo.
3. Mostrar visualmente cada etapa.
4. Obtener peso y dimensiones.
5. Aplicar los límites configurables.
6. Determinar si la botella es válida.
7. Obtener su color.
8. Intentar identificar la marca.
9. Clasificar la botella en uno de los cinco contenedores.
10. Actualizar los contadores.
11. Registrar el resultado en CSV.
12. Permitir modificar los parámetros en tiempo real.
13. Permitir modificar la velocidad de simulación.
14. Mostrar claramente el resultado de aceptación o rechazo.

---

# 28. Concepto general

La propuesta puede resumirse como:

> **Una estación automatizada de recuperación y clasificación de botellas de vidrio postconsumo que combina medición física, visión artificial, OCR y separación automatizada para generar información trazable sobre los envases recuperados.**

El valor principal del sistema no está únicamente en separar botellas, sino en **convertir el proceso de recuperación postconsumo en una fuente estructurada de datos** que pueda posteriormente apoyar la logística inversa, la reutilización, el reciclaje y la toma de decisiones dentro de una estrategia de economía circular.
