var path = require('path');
var tester = require('gitbook-tester');
const content ="{@puml}\n" +
    "@startuml\n" +
    "Object <|-- ArrayList\n" +
    "Object : equals()\n" +
    "ArrayList : Object[] elementData\n" +
    "ArrayList : size()\n" +
    "@enduml\n" +
    "{@endpuml}";

tester.builder()
    .withContent(content)
    .withBookJson({
        plugins: ['GraphvizAndPlantUML'],
        "GraphvizAndPlantUML": {
            "GraphvizDotFile": "/usr/local/opt/graphviz/bin/dot",
            "PlantJar": "/usr/local/Cellar/plantuml/1.2018.12/libexec/plantuml.jar"
        },
    })
    .withLocalPlugin(path.join(__dirname, '..'))
    .create()
    .then(function(result) {
        // console.log(result[0])
    });
