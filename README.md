Render GraphViz and PlantUML offline.

[![version](https://img.shields.io/npm/v/gitbook-plugin-graphviz-and-plant-uml.svg)](https://www.npmjs.com/package/gitbook-plugin-graphviz-and-plant-uml)
[![download](https://img.shields.io/npm/dm/gitbook-plugin-graphviz-and-plant-uml.svg)](https://www.npmjs.com/package/gitbook-plugin-graphviz-and-plant-uml)


## Features
* Rendering PlantUML from local or server.
* Support PDF exporting.
* ZERO npm dependency.

## How Does it work

1. Your UML/Diagram string quote with PlantUML/DOT
2. run exec file and get output
3. SVG(XML) file
4. <img src='data:image/svg+xml;base64,xxxx'>


## Pre Installation

### Server Side

Nothing but same as <https://github.com/qjebbs/vscode-plantuml#requirements-for-plantumlserver-render>


### Client Side

* [Java](https://java.com) is a cross-platform Virtual Machine, which is install on Mac/Linux by default.
* [Graphviz](https://www.graphviz.org) is open source graph visualization software. It has several main graph layout programs.
* [plantuml](http://plantuml.com/) can easily create UML Diagrams from simple textual description.

We need to install these tools before rendering UML.

If your are Mac user, try with [brew](https://brew.sh/)

```sh
brew install graphviz
brew install plantuml
```

If your are the other OS user, install them manually on official website or package manager(eg, yum install graphviz).


## Installation for Gitbook

In your book.json


## Server Side Rendering

Please keep in mind, if you want more about privacy/safety, please replace your own LOCAL render server.

```json
{
  "plugins": ["graphviz-and-plant-uml"],
  "pluginsConfig": {
    "graphviz-and-plant-uml": {
      "Render": "PlantUMLServer",
      "Server": "http://www.plantuml.com/plantuml"
    }
  }
}
```

## Client Side Rendering

```json
{
  "plugins": ["graphviz-and-plant-uml"],
  "pluginsConfig": {
    "graphviz-and-plant-uml": {
      "GraphvizDotFile": "/usr/local/opt/graphviz/bin/dot",
      "PlantJar": "/usr/local/Cellar/plantuml/1.2018.12/libexec/plantuml.jar"
    }
  }
}
```

And all, finally

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

> `@startuml` and `@endpuml` are ALWAYS required or the image will fail to be generated.

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

> `puml` and `plantuml` tags both work.

> see more at Jetbrains's [Visualizing Diagrams](https://www.jetbrains.com/help/idea/markdown.html)
