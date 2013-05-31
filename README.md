## osmCatalog

Это каталог тэгов OpenStreetMap.

Позиционируется в нескольких качествах:

- Источник информации о POI

  Может использоваться в программах, отображающих POI, так как
  содержит в машиночитаемом формате (JSON) иерархию объектов и их
  свойств, также информацию о том как выделить эти объекты из OSM
  данных и как их корректно отобразитьв машиночитаемом формате

- Справочник по тэгам

  В некотором смысле, альтернатива OSM wiki или страницы How_to_map_a
  оттуда

- Источник информации для генерации preset'ов для редакторов OSM

- Демонстрация разнообразия объектов, присутствующих в OSM

### Структура каталога

- catalog.json - основной файл каталога
- dictionary/dictionary_*.json - файл переводов
- poi_marker/ - иконки для POI
- check.js - скрипт для проверки каталога на отсутствие ошибок
- viewer.html, viewer/ - просматривалка каталога

### Формат каталога

### Валидация

### Просматривалка каталога

### Иконки

wiki http://wiki.openstreetmap.org/wiki/RU:Catalog

list json validators  http://yeap.narod.ru/js/026.html

icon marker  http://mapicons.nicolasmollet.com/markers/stores/general-merchandise/supermarket/?custom_color=2580d0

======================================================================

This is an OpenStreetMap tag catalog. It aims for several usages:

- Source of POI
