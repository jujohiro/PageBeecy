#!/bin/bash

echo "===================================="
echo "  Beecy Admin - Servidor Local"
echo "===================================="
echo ""
echo "Iniciando servidor en http://localhost:8000"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

python3 -m http.server 8000

