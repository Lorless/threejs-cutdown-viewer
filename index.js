function init() {


    //const ovcamera= new THREE.OrthographicCamera(left, right, bottom, top, near, far);

    var options = {
        ortho: true
    };


    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const ovcamera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / -2, window.innerHeight / 2, -2000, 10000);
    console.log(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -2000, 10000);
    //const pscamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
    const objects = [];
    const camera = ovcamera;
    const loader = new THREE.SVGLoader();

    console.log(camera);

    let renderer = new THREE.WebGLRenderer();
    renderer = new THREE.SVGRenderer();


    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    //camera.position.z = 1000;

    // for(let i =1; i <= 5; i++){
    //     load('svgs/'+i+'.svg');
    // }

    let displayables = json.series.viewList[0].drawingModel.currentDisplayables;

    for (let x = 0; x < displayables.length; x++) {
        let content = displayables[x].display.replace(/\n|\r/gi, "");
        let parsed = loader.parse(content);
        doneFn(parsed);
    }

    // for(let x = 0; x <=5; x++){
    //     loader.load('svgs/'+x+'.svg', doneFn);
    //     console.log('svgs/'+x+'.svg');
    // }

    // //loader.load('copyright.svg', doneFnWrapper);
    // loader.load('dragon.svg', doneFnWrapperName);
    // loader.load('cartman.svg', doneFnWrapper);

    function doneFnWrapper(data) {

        doneFn(data, true,)
    }

    function doneFnWrapperName(data) {
        doneFn(data, true, 'dragon')
    }

    function doneFn(data, ignorePointAdjust, name) {


        var paths = data.paths;

        var group = new THREE.Group();


        for (let x = 0; x < paths.length; x++) {


            for (var i = 0; i < paths[x].subPaths.length; i++) {

                var path = paths[x].subPaths[i];

                const points = path.getPoints();


                if (!ignorePointAdjust) {
                    points.forEach((point) => {
                        point.x -= 300;
                        point.y -= 300;
                    });
                }


                const geometry = new THREE.BufferGeometry().setFromPoints(points);

                const material = new THREE.LineBasicMaterial({color: paths[x].userData.style.stroke});

                const line = new THREE.Line(geometry, material);
                group.add(line);


            }
        }

        if (name === 'dragon') {
            console.log('dragon', group);
            group.scale.set(0.1, 0.1, 0.1)
        }
        // console.log(group);
        scene.add(group);
    }


    // var path = new THREE.Path();
    //
    // path.lineTo(100, 100);
    // path.quadraticCurveTo(0, 1, -200, 250);
    // path.lineTo(1, 1);
    //
    // var points = path.getPoints();
    //
    // var geometry = new THREE.BufferGeometry().setFromPoints(points);
    // var material = new THREE.LineBasicMaterial({color: 'red'});
    //
    // var line = new THREE.Line(geometry, material);
    // scene.add(line);


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

