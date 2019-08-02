function init() {

    //endpoints
    const naturalUrl = 'http://localhost:8081';
    const corsUrl = 'http://localhost:1337/localhost:8081';
    const useCors = true;
    const url  = useCors ? corsUrl : naturalUrl;

    //set up canvas and loader type
    const canvasLeft = -(window.innerWidth / 2), canvasBottom = -(window.innerHeight / 2),
        canvasTop = window.innerHeight / 2;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const loader = new THREE.SVGLoader();


    let clientX = null;
    let clientY = null;

    let lastClick = null;
    let thisClick = null;

    // set up camera
    const ovcamera = new THREE.OrthographicCamera(
        window.innerWidth / -2, // frustum left plane
        window.innerWidth / 2, // frustum right plane.
        window.innerHeight / 2, // frustum top plane.
        window.innerHeight / -2, // frustum bottom plane.
        -200, // frustum near plane.
        500 // frustum far plane.
    );

    //perspective camera for testing
    const pscamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 150);
    let camera = ovcamera;
    camera.position.z = 100;


    // renderer type
    let webRenderer = new THREE.WebGLRenderer({antialias: true});
    let svgRenderer = new THREE.SVGRenderer();
    let renderer = webRenderer;
    renderer.setPixelRatio(window.devicePixelRatio);

    //RENDERER SIZE!
    renderer.setSize(window.innerWidth, window.innerHeight);

    //add the canvas to the dom
    document.body.appendChild(renderer.domElement);

    let guiData = {
        // currentURL: '2.svg',
        drawFillShapes: true,
        drawStrokes: true,
        fillShapesWireframe: false,
        strokesWireframe: false
    };

    let dragObjects = [];
    let hotspots = [];

    // lighting
    const ambient = new THREE.AmbientLight(0xFFFFFF);
    scene.add(ambient);
    scene.add(camera);

    //render some text
    // let text = 'this is some test text',
    //     height = 20,
    //     size= 70,
    //     hover =30,
    //     curveSegments = 4,
    //     bevelThickness = 2,
    //     bevelSize = 1.5,
    //     bevelEnabled = true,
    //     font= undefined,
    //     fontName = "optimer",
    //     fontWeight = "bold";


    let fontLoader = new THREE.FontLoader();
    let loadedFont;



    Promise.all([loadFont(), fetchExam()]).then(res =>{
        console.log('font loaded', res);
        loadSVGS(res[1]);
        loadImage();
        setUpClickEvents();
    }, err=>{
        console.log('font load failed', err);
    });

    function setUpClickEvents(){
        //document.onclick = handleMouseMove;
        document.onmousedown = mouseDown;
        document.onmouseup = mouseUp;
    }

    function loadFont(){
        return fontLoader.load( 'fonts/Bebas Neue_Regular.json', function ( font ) {
            loadedFont = font;
        } );
    }



    //start the fetch exam and render
    if(getExam()!==null){
        fetchExam().then(response => {

        }, err =>{
            alert('Fetch Exam: '+err);
        });
    } else{
        console.log('failed exam get');
        let div = document.createElement('div');
        div.innerHTML = 'provide exam number: 127.0.0.1:8080?exam=0';
        document.body.prepend(div);
    }

    // render
    animate();

    function animate() {


        requestAnimationFrame(animate);
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }


    function mouseDown(e){
        lastClick = {x:e.clientX, y:e.clientY};

    }

    function mouseUp(e){

        thisClick = {x:e.clientX, y:e.clientY};
        let dragPos = {
            x1: lastClick.x,
            x2: thisClick.x,
            y1: lastClick.y,
            y2: thisClick.y,
            right: false,
            shift: false
        };
        postPosition(dragPos);
    }


    function getExam() {
        let urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('exam');

    }

    function loadText(textObj, color){
        console.log('textObj',textObj);
        var textGeo = new THREE.TextGeometry( textObj.text, {
            font: loadedFont,
            size: 12,
            height: 5,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 10,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 5
        } );

        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();

        textGeo = new THREE.BufferGeometry().fromGeometry( textGeo );
        let materials = [
            new THREE.MeshPhongMaterial( { color: color, flatShading: false } ), // front
            new THREE.MeshPhongMaterial( { color: color } ) // side
        ];
        let textMesh1 = new THREE.Mesh( textGeo, materials );

        textMesh1.position.x = translateX(textObj.x);
        textMesh1.position.y = translateY(textObj.y);
        console.log(textMesh1.position.y);
        if(textMesh1.position.y < -500){
            textMesh1.position.y += 200;
        }
        textMesh1.position.z = 0;
        textMesh1.rotation.x = 0;
        textMesh1.rotation.y = Math.PI * 2;
        scene.add(textMesh1);
    }

    function translateY(y){
        console.log(canvasTop, y, canvasTop -y);
        return canvasTop - y ;
    }

    function translateX(x){
        return canvasLeft + x;
    }

    function fetchExam() {

        let opts = {
            headers: {
                Accept: 'application/json',
            }
        };
        return fetch(url + '/exam/' + getExam() + '/display/TEMPLATE_ORTHO_ID', opts).then(response => {

            return new Promise((resolve, reject) => {
                console.log(response);
                if (response.ok) {
                    return resolve(response.json())
                } else {
                    console.log('reject!');
                    return reject("FAILURE")
                }
            })
        });
    }

    // remove everything but the background image
    function clearScene(){
        for(let i = scene.children.length-1; i >= 0; i--){
            let child = scene.children[i];
            if(child.name!=='background'&&child.type==='Mesh'){
                scene.remove(child);
            }
        }
    }

    //send the svg data through the parser and render it
    function loadSVGS(displayables) {
        console.log(displayables);


        for (let x = 0; x <= 5; x++) {
            let displayable = displayables[x];
            let content = displayable.display.replace(/\n|\r/gi, "");
            let parsed = loader.parse(content);


            parsed.paths = parsed.paths.slice(0, parsed.paths.length);

            let hotzones = displayable.hotzone;
            hotzones.forEach(hotzone => {
                addHotspot(hotzone.bounds);
            });


            // let textArray = pullTextFromXML(content);
            // console.log(parsed);
            // textArray.forEach(txtObj => loadText(txtObj));

            //let textArray = findTextInNode(parsed.xml);
            let textArray2 = findTextInNode2((parsed.xml));
            console.log('textArray2',textArray2);
            //console.log(parsed);
            //console.log('textArray',textArray);

            // if(textArray[0].group){
            //     let color = textArray[0].fill;
            //     textArray[0].children.forEach(child=>{
            //         loadText(child, color);
            //     })
            // }


            loadSVGCallback(parsed);

        }

    }

    function getTextAttributes(structure, attributesMap){
        console.log(attributesMap);
        for(let i = 0; i < attributesMap.length; i++){
            let attr = attributesMap[i];
            if(attr.name!=='xml:space'){
                structure[attr.name] = attr.value;
            }
        }
        return structure;
    }

    function hasAttributes(attributesMap){
        for(let i = 0; i < attributesMap.length; i++){
            let attr = attributesMap[i];
            if(attr.name==='fill'||attr.name==='font-size'||attr.name==='font-family'||attr.name==='stroke'){
                console.log('found', attr.name);
                return true
            }
        }
    }

    function getGroupAttributes(){

    }

    function findTextInNode2(xmlObj){

        let structure = {
            name: xmlObj.nodeName,
            xmlObj: xmlObj,
            children: []
        };


        if(xmlObj.nodeName==='text'){

            structure.text = xmlObj.innerHTML;
            structure = getTextAttributes(structure, xmlObj.attributes);


        } else {
            if(hasAttributes(xmlObj.attributes)){
                structure = getGroupAttributes(structure, xmlObj.attributes);
            }
            for(let i = 0; i < xmlObj.children.length; i++){
                if(xmlObj.children[i].nodeName!=='defs'){
                    let sub = findTextInNode2( xmlObj.children[i]);
                    structure.children.push(sub);
                }

            }

        }

        return structure;

    }

    function findTextInNode(xmlObj, textChildren){

        let currentText = [];
        if(textChildren!==undefined){
            currentText = currentText.concat(textChildren);
        }



        if(xmlObj.nodeName==='text'){
            console.log('attributes',xmlObj.attributes);
            let textObj = {text:xmlObj.innerHTML};
            for(let i = 0; i < xmlObj.attributes.length; i++){
                let attr = xmlObj.attributes[i];
                if(attr.name==='x'){
                    textObj.x = parseInt(attr.value);
                }
                if(attr.name==='y'){
                    textObj.y = parseInt(attr.value);
                }
                if(attr.name==='stroke'){
                    textObj.stroke = attr.value;
                }
            }
            currentText.push(textObj);
            return currentText;
        } else if (xmlObj.children) {

            let hasFill = false;
            if(xmlObj.nodeName==='g'){

                for(let i = 0; i < xmlObj.attributes.length; i++){
                    let attr = xmlObj.attributes[i];
                    if(attr.name==='fill'){
                        hasFill = attr.value;
                    }
                }
            }
            let childText = [];
            if(hasFill){
                childText.push({group:true, fill:hasFill, children:[]})
            }
            for(let i = 0; i < xmlObj.children.length; i++){
                if(hasFill){
                    childText[0].children = childText[0].children.concat(findTextInNode(xmlObj.children[i], currentText));
                } else{
                    childText =  childText.concat(findTextInNode(xmlObj.children[i], currentText));
                }

            }
            return childText;
        } else {
            return currentText;
        }

    }

    function pullTextFromXML(xmlString, previousTextArray){
        if(previousTextArray===undefined){
            previousTextArray = [];
        }
        let indexOfText = xmlString.indexOf('<text');

        if(indexOfText!==-1){
            xmlString = xmlString.slice(indexOfText, xmlString.length);
            let endOfThisText = xmlString.indexOf('</text>');
            if(endOfThisText!==-1){
                let currentTextNode = xmlString.slice(0, endOfThisText+7);
                let position = pullXYFromTextNode(currentTextNode);

                let currentText = currentTextNode.slice(currentTextNode.indexOf('>')+1, currentTextNode.indexOf('</text>'));
                previousTextArray.push({x:position.x, y:position.y, text:currentText});
                let restOfNode = xmlString.slice(endOfThisText+7, xmlString.length);
                    return pullTextFromXML(restOfNode, previousTextArray);
            } else{
                console.error('ERROR: Couldn\'t find the closing </text> tag');
            }
        } else{
            return previousTextArray;
        }
    }

    function pullXYFromTextNode(textNode){

        let position = {
            x:null,
            y:null
        };
        let xAndY = textNode.split(' ').filter(str=> str.slice(0,2)==='x='||str.slice(0,2)==='y=');
        xAndY.forEach(attr => {
            let attrSplit = attr.split('"');

            position[attrSplit[0].slice(0,1)] = parseInt(attrSplit[1]);
        });
        return position;


    }


    //tell the backend how to move the templates
    function postPosition(data) {
        let opts = {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        fetch(url+'/exam/' + getExam() + '/drag', opts)
            .then(response => {
                    if(response.ok===true){
                        response.json().then((res) => {
                            console.log(res);
                            clearScene();
                            loadImage();
                            loadSVGS(res);
                        });
                    }

                }
            ).catch(err => {

        })
    }


    //on window resize update the canvas size
    //window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }



    function loadSVGCallback(data) {
        let meshObjects = [];
        let paths = data.paths;

        for (var i = 0; i < paths.length; i++) {
            let path = paths[i];
            let fillColor = path.userData.style.fill;
            if (guiData.drawFillShapes && fillColor !== undefined && fillColor !== 'none') {

                let material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setStyle(fillColor),
                    opacity: path.userData.style.fillOpacity,
                    transparent: path.userData.style.fillOpacity < 1,
                    side: THREE.DoubleSide,
                    depthWrite: true,
                    wireframe: guiData.fillShapesWireframe
                });
                let shapes = path.toShapes(true);

                for (let j = 0; j < shapes.length; j++) {
                    let shape = shapes[j];

                    let geometry = new THREE.ShapeBufferGeometry(shape);
                    let mesh = new THREE.Mesh(geometry, material);
                    meshObjects.push(mesh);

                }
            }
            var strokeColor = path.userData.style.stroke;
            if (guiData.drawStrokes && strokeColor !== undefined && strokeColor !== 'none') {

                let material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setStyle(strokeColor),
                    opacity: path.userData.style.strokeOpacity,
                    transparent: path.userData.style.strokeOpacity < 1,
                    side: THREE.DoubleSide,
                    depthWrite: true,
                    wireframe: guiData.strokesWireframe
                });

                for (let j = 0; j < path.subPaths.length; j++) {
                    let subPath = path.subPaths[j];

                    let geometry = THREE.SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);

                    if (geometry) {
                        let mesh = new THREE.Mesh(geometry, material);

                        meshObjects.push(mesh);
                    }
                }

            }
        }

        let geometries = meshObjects.map(mesh => {
            let g = new THREE.Geometry();
            g.fromBufferGeometry(mesh.geometry);
            return g;
        });

        if (geometries.length) {
            let singleGeometry = new THREE.Geometry();

            geometries.forEach(g => {
                //g.updateMatrix(); // as needed
                singleGeometry.merge(g);
            });

            let material = new THREE.MeshBasicMaterial({color: 0xFF0080});
            let mesh = new THREE.Mesh(singleGeometry, material);
            mesh.scale.y = -1;
            mesh.scale.x = 1;
            mesh.position.z = 20;
            mesh.position.x = canvasLeft;
            mesh.position.y = canvasTop;

            scene.add(mesh);
            dragObjects.push(mesh);

        }
    }


    //draw a hotspot on the canvas
    function addHotspot(bounds) {

        let geometry = new THREE.BoxGeometry(bounds.w, bounds.h, 1);
        let material = new THREE.MeshBasicMaterial({color: 0x00b311, opacity: 0.5, transparent: true});
        let cube = new THREE.Mesh(geometry, material);
        cube.position.z = 21;
        cube.position.x = canvasLeft + bounds.x + (bounds.w / 2);
        cube.position.y = canvasTop - bounds.y - (bounds.h / 2);
        scene.add(cube);

        hotspots.push(cube);
    }


    // Create a texture loader so we can load our image file
    // Load an image file into a custom material
    let imageMesh;

    function loadImage(callback) {
        let textureLoader = new THREE.TextureLoader();
        textureLoader.load(url+'/exam/'+getExam()+'/image', (texture) => {
            let material = new THREE.MeshBasicMaterial({
                map: texture
            });

            // create a plane geometry for the image with a width of 10
            // and a height that preserves the image's aspect ratio

            const imageWidth = 2500;
            const imageHeight = 2048;

            const halfWidth = imageWidth / 2, halfHeight = imageHeight / 2;

            const useWidth = halfWidth;
            const useHeight = halfHeight;


            let geometry = new THREE.PlaneGeometry(useWidth, useHeight);

            // combine our image geometry and material into a mesh
            imageMesh = new THREE.Mesh(geometry, material);

            imageMesh.name = 'background';


            // set the position of the image imageMesh in the x,y,z dimensions
            imageMesh.position.set(canvasLeft + useWidth / 2, canvasBottom + useHeight / 2, 0);


            // add the image to the scene
            scene.add(imageMesh);
            if (callback) {
                callback();
            }

        }, () => {

        }, (err) => {

        });
    }




    //unused drag controls (for now)

    // let dragControls = new THREE.DragControls(dragObjects, camera, renderer.domElement);
    // dragControls.addEventListener('dragstart', function (e) {
    //
    //     console.log(e);
    //
    //     dragPos.x1 = e.object.position.x;
    //     dragPos.y1 = e.object.position.y
    //
    // });
    // dragControls.addEventListener('dragend', function (e) {
    //
    //     dragPos.x2 = clientX;
    //     dragPos.y2 = clientY;
    //     postPosition(dragPos);
    // });


}

