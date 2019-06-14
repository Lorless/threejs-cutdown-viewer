function init() {

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const loader = new THREE.SVGLoader();

    // flipped orthographic camera displays svgs in correct orientation
    // const ovcamera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / -2, window.innerHeight / 2, 1, 1110);

    // unflipped orthograpic camera displays plane with image correctly but svgs are flipped ?
    const ovcamera = new THREE.OrthographicCamera(
        window.innerWidth / -2, // frustum left plane
        window.innerWidth / 2, // frustum right plane.
        window.innerHeight / 2, // frustum top plane.
        window.innerHeight / -2, // frustum bottom plane.
        1, // frustum near plane.
        110 // frustum far plane.
    );
    //perspective camera for testing
    const pscamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1100);
    let camera = pscamera;

    camera.position.z = 1000;


    let webRenderer = new THREE.WebGLRenderer();
    let svgRenderer = new THREE.SVGRenderer();
    let renderer = webRenderer;


    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    //add the canvas to the dom
    document.body.appendChild(renderer.domElement);


    // for(let i =1; i <= 5; i++){
    //     load('svgs/'+i+'.svg');
    // }

    let displayables = json.series.viewList[0].drawingModel.currentDisplayables;

    for (let x = 1; x < 6; x++) {
        let content = displayables[x].display.replace(/\n|\r/gi, "");
        //let parsed = loader.parse(content);
        loader.load('svgs/' + x + '.svg', doneFn);
        //doneFn(parsed);
    }

    // for(let x = 0; x <=5; x++){
    //     loader.load('svgs/'+x+'.svg', doneFn);
    //     console.log('svgs/'+x+'.svg');
    // }

    // //loader.load('copyright.svg', doneFnWrapper);
    // loader.load('dragon.svg', doneFnWrapperName);


    function doneFnWrapper(data) {

        doneFn(data, true,)
    }

    function doneFnWrapperName(data) {
        doneFn(data, true, 'dragon')
    }

    let objects = [];

    function doneFn(data, ignorePointAdjust, name) {


        var paths = data.paths;

        var group = new THREE.Group();


        for (let x = 0; x < paths.length; x++) {


            for (var i = 0; i < paths[x].subPaths.length; i++) {

                var path = paths[x].subPaths[i];

                const points = path.getPoints();


                if (!ignorePointAdjust) {
                    points.forEach((point) => {
                        point.x -= 150;
                        point.y -= 150;
                    });
                }


                const geometry = new THREE.BufferGeometry().setFromPoints(points);

                const material = new THREE.LineBasicMaterial({color: paths[x].userData.style.stroke});

                const line = new THREE.Line(geometry, material);

                //line.rotation.x = 1;

                group.add(line);




            }
        }

        // console.log(group);
        scene.add(group);
        objects.push(group);
        group.rotation.x = 3.141;
    }


    // Create a texture loader so we can load our image file
    let textureLoader = new THREE.TextureLoader();

    // Load an image file into a custom material

    let material;
    let mesh;
    let cube;

    console.log('textureLoader');
    let img = 'http://www.startradiology.com/uploads/images/english-class-x-hip-fig10-ap-view-lines-blanco.jpg';
    let ovImage = 'http://127.0.0.1:1337/stuart.adam.com/exam/0/image';
    textureLoader.load('image.jfif', (texture) => {
        console.log('texture', texture);
        material = new THREE.MeshBasicMaterial({
            map: texture
        });

        // create a plane geometry for the image with a width of 10
        // and a height that preserves the image's aspect ratio
        let geometry = new THREE.PlaneGeometry(200, 200);

        // combine our image geometry and material into a mesh
        mesh = new THREE.Mesh(geometry, material);


        // set the position of the image mesh in the x,y,z dimensions
        mesh.position.set(0, 0, 0);


        // add the image to the scene
        scene.add(mesh);
        console.log('mesh', mesh);
    }, () => {
        console.log('progress')
    }, (err) => {
        console.log('failed!', err);
    });


    // lighting
    const ambient = new THREE.AmbientLight(0x80ffff);
    scene.add(ambient);
    scene.add(camera);

    // render
    animate();


    function animate() {

        if(objects[0]){
          //objects.forEach(obj=> obj.rotateX()
            console.log(objects[0].rotation.x);
        }


        requestAnimationFrame(animate);
        render();
    }

    function render() {
        renderer.render(scene, camera);
    }

}

