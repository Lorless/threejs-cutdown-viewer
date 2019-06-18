function init() {

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
        1, // frustum near plane.
        150 // frustum far plane.
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


    let guiData = {
        // currentURL: '2.svg',
        drawFillShapes: true,
        drawStrokes: true,
        fillShapesWireframe: false,
        strokesWireframe: false
    };


    let objects = [];

    let displayables = json.series.viewList[0].drawingModel.currentDisplayables;

    loadSVGS();
    loadImage();
    addCube();

    function loadSVGS() {
        for (let x = 0; x <= 5; x++) {
            let content = displayables[x].display.replace(/\n|\r/gi, "");
            let parsed = loader.parse(content);
            loadSVGCallback(parsed);
        }
    }


    function loadSVGCallback(data) {
        let paths = data.paths;
        let group = new THREE.Group();
        // //group.scale.multiplyScalar(1);
        // // group.position.x = -600;
        // // group.position.y = 500;
        // group.position.z = 2;
        group.scale.y *= -1;
        // group.scale.x *= 1;
        for (var i = 0; i < paths.length; i++) {
            let path = paths[i];
            let fillColor = path.userData.style.fill;
            if (guiData.drawFillShapes && fillColor !== undefined && fillColor !== 'none') {
                console.log('drawFill');
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
                for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
                    let subPath = path.subPaths[j];

                    // subPath.currentPoint.x = -((window.innerWidth / 2) - subPath.currentPoint.x);
                    // subPath.currentPoint.y = -((window.innerHeight / 2) - subPath.currentPoint.y);
                    // console.log(subPath.currentPoint.y);
                    // //console.log('subpath', subPath);
                    // subPath.curves.forEach(curve => {
                    //     if (curve.v1 && curve.v2) {
                    //         curve.v1.x = subPath.currentPoint.x;
                    //         curve.v2.x = subPath.currentPoint.x;
                    //         //curve.v1.y = subPath.currentPoint.y;
                    //         //curve.v2.y = subPath.currentPoint.y;
                    //     }
                    // });
                    console.log('subpath', subPath);

                    let geometry = THREE.SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
                    if (geometry) {
                        let mesh = new THREE.Mesh(geometry, material);
                        group.add(mesh);
                    }
                }

            }
        }

        group.position.z = 1;
        group.position.x = -(window.innerWidth/2);
        group.position.y = (window.innerHeight/2);
        scene.add(group);
        //console.log(group.position);
        objects.push(group);

    }


    function addCube() {

        let geometry = new THREE.BoxGeometry(100, 100, 100);
        let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        let cube = new THREE.Mesh(geometry, material);
        cube.position.z = 20;
        cube.position.x = 0;
        cube.position.y = 200;
        scene.add(cube);
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
            console.log(texture);
            let geometry = new THREE.PlaneGeometry(1500, 1048);

            // combine our image geometry and material into a mesh
            imageMesh = new THREE.Mesh(geometry, material);


            // set the position of the image imageMesh in the x,y,z dimensions
            imageMesh.position.set(0, 0, 0);

            if (imageMesh) {
                console.log('imageMesh', imageMesh.position.z);
            }


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

