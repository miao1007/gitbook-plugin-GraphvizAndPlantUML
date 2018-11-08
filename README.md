Render GraphViz and PlantUML offline.

## Features
* Generate PlantUML with quick installation
* Zero npm dependency.

## How Does it work

```
1. Your UML/Diagram string quote with plantuml/dot
2. run exec file and get output
3. SVG(XML)
4. <img src='data:image/svg+xml;base64,xxxx'>
```

## Background

* Java is a cross-platform Virtual Machine, which is install on Mac/Linux by default.
* [Graphviz](https://www.graphviz.org) is open source graph visualization software. It has several main graph layout programs.
* [plantuml](http://plantuml.com/) can easily create UML Diagrams from simple textual description.

We need above tools to create UML.

## Install

If your are Mac user, try with [brew](https://brew.sh/)

```sh
brew install graphviz
brew install plantuml
```

If your are other OS user, install manually on official website.

then in your book.json

```json
{
  "plugins": ["graphviz-and-plant-uml"],
  "pluginsConfig": {
    "graphviz-and-plant-uml": {
      "GraphvizDotFile": "/usr/local/opt/graphviz/bin/dot",
      "PlantJar": "/usr/local/Cellar/plantuml/1.2018.12/libexec/plantuml.jar"
    },
  }
}
```

then

```sh
# install plugin
gitbook install
# run the gitbook
gitbook serve
```

### How to use it?

```
{% puml %}
@startuml
Object <|-- ArrayList
Object : equals()
ArrayList : Object[] elementData
ArrayList : size()
@enduml
{% endpuml %}
```

or

    ```puml
    @startuml
    Object <|-- ArrayList
    Object : equals()
    ArrayList : Object[] elementData
    ArrayList : size()
    @enduml
    ```

Plugin will pick up block body and replace it with generated base64 svg diagram.

## RoadMap
Support more about GraphViz's dot