/* Ejercicios de algoritmia (Modelo de Examen: diagramas de flujo, pseudocódigo, resolución de problemas).
   gen: generador de entradas para desafíos de prueba de escritorio:
     ['r', min, max]           → un número al azar
     ['lista', min, max, k1, k2, fin] → k números y luego el valor de corte
     ['n', k1, k2, min, max]   → primero la cantidad n y luego n números */
'use strict';

const ALGOS = [
  { id: 'al01', t: 'Suma y promedio de dos números', nivel: 1, tema: 'Secuencial',
    enun: 'Leer dos números, mostrar su suma y su promedio.',
    gen: [['r', 1, 20], ['r', 1, 20]],
    code: `Algoritmo SumaPromedio
    Definir a, b, suma Como Real
    Leer a
    Leer b
    suma <- a + b
    Escribir "Suma: ", suma
    Escribir "Promedio: ", suma / 2
FinAlgoritmo` },
  { id: 'al02', t: 'Par o impar', nivel: 1, tema: 'Selección · MOD',
    enun: 'Leer un número entero e informar si es par o impar.',
    gen: [['r', 1, 99]],
    code: `Algoritmo ParImpar
    Definir n Como Entero
    Leer n
    Si n MOD 2 = 0 Entonces
        Escribir n, " es par"
    SiNo
        Escribir n, " es impar"
    FinSi
FinAlgoritmo` },
  { id: 'al03', t: 'Mayor de tres números', nivel: 2, tema: 'Selección anidada',
    enun: 'Leer tres números distintos y mostrar el mayor.',
    gen: [['r', 1, 50], ['r', 1, 50], ['r', 1, 50]],
    code: `Algoritmo MayorDeTres
    Definir a, b, c, mayor Como Entero
    Leer a, b, c
    Si a > b Entonces
        mayor <- a
    SiNo
        mayor <- b
    FinSi
    Si c > mayor Entonces
        mayor <- c
    FinSi
    Escribir "Mayor: ", mayor
FinAlgoritmo` },
  { id: 'al04', t: 'Promedio de notas hasta ingresar 0', nivel: 2, tema: 'Mientras · contador · acumulador',
    enun: 'Leer notas hasta que se ingrese 0 y mostrar el promedio. Proteger la división por cero (caso del episodio c1).',
    gen: [['lista', 1, 10, 2, 4, 0]],
    code: `Algoritmo PromedioNotas
    Definir nota, suma, cant Como Real
    suma <- 0
    cant <- 0
    Leer nota
    Mientras nota <> 0 Hacer
        suma <- suma + nota
        cant <- cant + 1
        Leer nota
    FinMientras
    Si cant > 0 Entonces
        Escribir "Promedio: ", suma / cant
    SiNo
        Escribir "No se ingresaron notas"
    FinSi
FinAlgoritmo` },
  { id: 'al05', t: 'Factorial', nivel: 2, tema: 'Para · acumulador de producto',
    enun: 'Leer n y calcular n! (el acumulador de producto arranca en 1).',
    gen: [['r', 1, 6]],
    code: `Algoritmo Factorial
    Definir n, i, f Como Entero
    Leer n
    f <- 1
    Para i <- 1 Hasta n Con Paso 1 Hacer
        f <- f * i
    FinPara
    Escribir n, "! = ", f
FinAlgoritmo` },
  { id: 'al06', t: 'Tabla de multiplicar', nivel: 1, tema: 'Para',
    enun: 'Leer un número y mostrar su tabla del 1 al 5.',
    gen: [['r', 2, 9]],
    code: `Algoritmo Tabla
    Definir n, i Como Entero
    Leer n
    Para i <- 1 Hasta 5 Hacer
        Escribir n, " x ", i, " = ", n * i
    FinPara
FinAlgoritmo` },
  { id: 'al07', t: 'Contar dígitos', nivel: 2, tema: 'Mientras · división entera',
    enun: 'Leer un entero positivo y contar cuántos dígitos tiene.',
    gen: [['r', 1, 99999]],
    code: `Algoritmo ContarDigitos
    Definir n, cant Como Entero
    Leer n
    cant <- 0
    Repetir
        n <- trunc(n / 10)
        cant <- cant + 1
    Hasta Que n = 0
    Escribir "Dígitos: ", cant
FinAlgoritmo` },
  { id: 'al08', t: '¿Es primo?', nivel: 3, tema: 'Mientras · bandera',
    enun: 'Leer un entero mayor que 1 e informar si es primo, usando una bandera.',
    gen: [['r', 2, 40]],
    code: `Algoritmo Primo
    Definir n, d Como Entero
    Definir esPrimo Como Logico
    Leer n
    esPrimo <- Verdadero
    d <- 2
    Mientras d * d <= n Y esPrimo Hacer
        Si n MOD d = 0 Entonces
            esPrimo <- Falso
        FinSi
        d <- d + 1
    FinMientras
    Si esPrimo Entonces
        Escribir n, " es primo"
    SiNo
        Escribir n, " no es primo"
    FinSi
FinAlgoritmo` },
  { id: 'al09', t: 'Serie de Fibonacci', nivel: 2, tema: 'Para · intercambio de variables',
    enun: 'Mostrar los primeros n términos de Fibonacci (0, 1, 1, 2, 3…).',
    gen: [['r', 3, 8]],
    code: `Algoritmo Fibonacci
    Definir n, i, a, b, aux Como Entero
    Leer n
    a <- 0
    b <- 1
    Para i <- 1 Hasta n Hacer
        Escribir a
        aux <- a + b
        a <- b
        b <- aux
    FinPara
FinAlgoritmo` },
  { id: 'al10', t: 'Invertir un número', nivel: 3, tema: 'Mientras · MOD',
    enun: 'Leer un entero positivo y mostrarlo invertido (123 → 321).',
    gen: [['r', 10, 9999]],
    code: `Algoritmo Invertir
    Definir n, inv Como Entero
    Leer n
    inv <- 0
    Mientras n > 0 Hacer
        inv <- inv * 10 + n MOD 10
        n <- trunc(n / 10)
    FinMientras
    Escribir "Invertido: ", inv
FinAlgoritmo` },
  { id: 'al11', t: 'Validar una nota con Repetir', nivel: 1, tema: 'Repetir · validación',
    enun: 'Pedir una nota hasta que esté entre 1 y 10 (el cuerpo se ejecuta al menos una vez).',
    gen: [['lista', 11, 15, 0, 2, 7]],
    code: `Algoritmo ValidarNota
    Definir nota Como Real
    Repetir
        Escribir "Ingrese nota (1 a 10):"
        Leer nota
    Hasta Que nota >= 1 Y nota <= 10
    Escribir "Nota válida: ", nota
FinAlgoritmo` },
  { id: 'al12', t: 'Jerarquía con Segun', nivel: 2, tema: 'Selección múltiple',
    enun: 'Leer un código de jerarquía (1 a 4) y mostrar su nombre.',
    gen: [['r', 1, 5]],
    code: `Algoritmo Jerarquia
    Definir cod Como Entero
    Leer cod
    Segun cod Hacer
        1:
            Escribir "Subteniente"
        2:
            Escribir "Teniente"
        3:
            Escribir "Teniente Primero"
        4:
            Escribir "Capitán"
        De Otro Modo:
            Escribir "Código inválido"
    FinSegun
FinAlgoritmo` },
  { id: 'al13', t: 'Máximo y mínimo de N números', nivel: 2, tema: 'Para · comparación',
    enun: 'Leer N y luego N números; mostrar el mayor y el menor.',
    gen: [['n', 3, 5, 1, 99]],
    code: `Algoritmo MaxMin
    Definir n, i, x, mayor, menor Como Entero
    Leer n
    Leer x
    mayor <- x
    menor <- x
    Para i <- 2 Hasta n Hacer
        Leer x
        Si x > mayor Entonces
            mayor <- x
        FinSi
        Si x < menor Entonces
            menor <- x
        FinSi
    FinPara
    Escribir "Mayor: ", mayor, " · Menor: ", menor
FinAlgoritmo` },
  { id: 'al14', t: 'Suma de pares hasta N', nivel: 1, tema: 'Para con paso',
    enun: 'Sumar los números pares de 2 hasta N usando Para con paso 2.',
    gen: [['r', 4, 20]],
    code: `Algoritmo SumaPares
    Definir n, i, s Como Entero
    Leer n
    s <- 0
    Para i <- 2 Hasta n Con Paso 2 Hacer
        s <- s + i
    FinPara
    Escribir "Suma de pares: ", s
FinAlgoritmo` },
  { id: 'al15', t: 'IMC del circuito médico', nivel: 2, tema: 'Selección · reales',
    enun: 'Calcular el índice de masa corporal y verificar el rango exigido por la Guía de Ingreso (18 a 30).',
    gen: [['r', 55, 95], ['r', 160, 190]],
    code: `Algoritmo IMC
    Definir peso, altura, imc Como Real
    Leer peso
    Leer altura
    altura <- altura / 100
    imc <- peso / (altura * altura)
    Escribir "IMC: ", redon(imc * 10) / 10
    Si imc >= 18 Y imc <= 30 Entonces
        Escribir "Dentro del rango exigido"
    SiNo
        Escribir "Fuera del rango 18-30"
    FinSi
FinAlgoritmo` },
  { id: 'al16', t: 'Cuenta regresiva de lanzamiento', nivel: 1, tema: 'Para con paso negativo',
    enun: 'Mostrar una cuenta regresiva desde n hasta 1.',
    gen: [['r', 3, 6]],
    code: `Algoritmo Cuenta
    Definir n, i Como Entero
    Leer n
    Para i <- n Hasta 1 Con Paso -1 Hacer
        Escribir i
    FinPara
    Escribir "¡Fuego!"
FinAlgoritmo` },
];

function genInputs(spec) {
  const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const out = [];
  (spec || []).forEach(g => {
    if (g[0] === 'r') out.push(r(g[1], g[2]));
    else if (g[0] === 'lista') { const k = r(g[3], g[4]); for (let i = 0; i < k; i++) out.push(r(g[1], g[2])); out.push(g[5]); }
    else if (g[0] === 'n') { const k = r(g[1], g[2]); out.push(k); for (let i = 0; i < k; i++) out.push(r(g[3], g[4])); }
  });
  return out;
}
