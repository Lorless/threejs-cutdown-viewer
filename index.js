function init() {

    const canvasLeft = -(window.innerWidth/2), canvasBottom = -(window.innerHeight/2), canvasTop = window.innerHeight/2;


    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const loader = new THREE.SVGLoader();

    //window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // flipped orthographic camera displays svgs in correct orientation
    // const ovcamera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / -2, window.innerHeight / 2, 1, 1110);

    // unflipped orthograpic camera displays plane with image correctly but svgs are flipped ?
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


    let webRenderer = new THREE.WebGLRenderer({antialias: true});

    let svgRenderer = new THREE.SVGRenderer();
    //let renderer = webRenderer;
    let renderer = webRenderer;


    renderer.setPixelRatio(window.devicePixelRatio);
    //RENDERER SIZE!
    renderer.setSize(window.innerWidth, window.innerHeight);

    //add the canvas to the dom
    document.body.appendChild(renderer.domElement);

    let helper = new THREE.GridHelper( 160, 10 );
    helper.rotation.x = Math.PI / 2;
    scene.add( helper );


    let guiData = {
        // currentURL: '2.svg',
        drawFillShapes: true,
        drawStrokes: true,
        fillShapesWireframe: false,
        strokesWireframe: false
    };


    let objects = [];

    let displayables = json.series.viewList[0].drawingModel.currentDisplayables;
    console.log(displayables);

    loadSVGS();
    loadImage();
    //addCube();

    //loader.load('copyright.svg', loadSVGCallback);

    function loadSVGS() {

        for (let x = 0; x <= 5; x++) {
            let displayable = displayables[x];
            let content = displayable.display.replace(/\n|\r/gi, "");
            let parsed = loader.parse(content);

            let hotzones = displayable.hotzone;
            hotzones.forEach(hotzone => {

            });

            loadSVGCallback(parsed);
        }

        console.log('objects', objects);
        let dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
        dragControls.addEventListener( 'dragstart', function () {
            console.log('dragStart');
        } );
        dragControls.addEventListener( 'dragend', function () {
            console.log('dragEnd')
        } );
    }



    function loadSVGCallback(data) {
        let paths = data.paths;
        let group = new THREE.Group();
        // scales a vector3 (x y and z) by given value 1,-1,1 by 2 becomes 2,-2,2
        // group.scale.multiplyScalar(2);
        // group.position.x = -600;
        //group.position.y = 500;
        // group.position.z = 2;

        //flips the y scale over so our upside down svg is now right way up
        group.scale.y = -1;

        // group.scale.x *= 1;
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


                    //shape.curves = modifyCurves(shape.curves);

                    let geometry = new THREE.ShapeBufferGeometry(shape);
                    let mesh = new THREE.Mesh(geometry, material);

                    group.add(mesh);
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

                        group.add(mesh);
                    }
                }

            }
        }

        group.position.z = 20;
        group.position.y = canvasTop;
        group.position.x = canvasLeft;

        objects.push(group);



        scene.add(group);
    }

    function modifyCurves(curves){
        // curves.forEach(curve => {
        //
        //     if (curve.v1 && curve.v2) {
        //         // objects.push(curve);
        //         // curve.v1.x = curve.v1.x;
        //         // curve.v2.x = curve.v2.x;
        //
        //         curve.v1.y = -curve.v1.y;
        //         curve.v2.y = -curve.v2.y;
        //     } else {
        //         curve.aY = -curve.aY;
        //         curve.aClockwise = true;
        //         //curve.aRotation = 1.5;
        //         console.log('curve 0 ', curve)
        //
        //     }
        // });
        //
        return curves;

    }


    function addCube() {

        //original draw position of first svg (small box) point at //M434.9438 234.0988 //L512.7757 263.6883
        let geometry = new THREE.BoxGeometry(5, 5, 2);
        let color = new THREE.Color( 0x00b300 );
        let material = new THREE.MeshBasicMaterial({color: color});
        let cube = new THREE.Mesh(geometry, material);
        cube.position.z = 20;
        cube.position.x = 434.9438;
        cube.position.y = 234.0988;
        scene.add(cube);
        let color1a = new THREE.Color( 0x000000 );
        let material1a = new THREE.MeshBasicMaterial({color: color1a});
        let cube1a = new THREE.Mesh(geometry, material1a);
        cube1a.position.x = 501.4073;
        cube1a.position.y =  294.6224;
        scene.add(cube1a);

        let cube1b = new THREE.Mesh(geometry, material);
        cube1b.position.x = 492.2168;
        cube1b.position.y =  296.7241;
        scene.add(cube1b);



        //center left
        let cube2 = new THREE.Mesh(geometry, material);
        cube2.position.x = canvasLeft;
        cube2.position.y = 0;
        scene.add(cube2);

        //center
        let cube3 = new THREE.Mesh(geometry, material);
        cube3.position.x = 0;
        cube3.position.y = 0;
        scene.add(cube3);

        //center bottom
        let cube4 = new THREE.Mesh(geometry, material);
        cube3.position.x = canvasLeft;
        cube3.position.y = canvasBottom;
        scene.add(cube4);

        //position of original svg first point when group moved to center left
        // let cube4 = new THREE.Mesh(geometry, material);
        // cube4.position.x = 0;
        // cube4.position.y = 0;
        // scene.add(cube4);


        let material2 = new THREE.MeshBasicMaterial({color: 0x008200});
        //position of original svg first point when group moved to center left
        let cube5 = new THREE.Mesh(geometry, material2);
        cube5.position.x = -20;
        cube5.position.y = 0;
        let cube6 = new THREE.Mesh(geometry, material2);
        cube6.position.x = 20;
        cube6.position.y = 0;
        let group = new THREE.Group();
        group.add(cube5);
        group.add(cube6);
        scene.add(group);
        group.position.x =0;



    }

    // Create a texture loader so we can load our image file
    // Load an image file into a custom material
    let imageMesh;
    let img = 'http://www.startradiology.com/uploads/images/english-class-x-hip-fig10-ap-view-lines-blanco.jpg';
    let ovImage = 'http://127.0.0.1:1337/stuart.adam.com/exam/0/image';

    function loadImage(callback) {
        let textureLoader = new THREE.TextureLoader();
        textureLoader.load('image.jfif', (texture) => {
            let material = new THREE.MeshBasicMaterial({
                map: texture
            });

            // create a plane geometry for the image with a width of 10
            // and a height that preserves the image's aspect ratio

            const imageWidth = 2500;
            const imageHeight = 2048;

            const halfWidth = imageWidth / 2,  halfHeight = imageHeight /2;

            const useWidth = halfWidth;
            const useHeight = halfHeight;


            let geometry = new THREE.PlaneGeometry(useWidth, useHeight);

            // combine our image geometry and material into a mesh
            imageMesh = new THREE.Mesh(geometry, material);


            // set the position of the image imageMesh in the x,y,z dimensions
            imageMesh.position.set(canvasLeft + useWidth/2 , canvasBottom + useHeight/2, 0);


            // add the image to the scene
            scene.add(imageMesh);
            if (callback) {
                callback();
            }

        }, () => {
            console.log('progress')
        }, (err) => {
            console.log('failed!', err);
        });
    }


    // lighting
    const ambient = new THREE.AmbientLight(0x80ffff);
    scene.add(ambient);
    scene.add(camera);

    // render
    animate();



    function animate() {


        requestAnimationFrame(animate);
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }

}

