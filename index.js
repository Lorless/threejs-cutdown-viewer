function init() {


    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const ovcamera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -2000, 10000);
    const objects = [];
    const camera = ovcamera;
    const loader = new THREE.SVGLoader();

    const renderer = new THREE.WebGLRenderer();
    renderer.antialias = true;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.z = 100;

    //load('test2.svg');
    load('test3.svg');

    //load('test3.svg');

    function load(filename){
        loader.load(filename, (data) => {

                var paths = data.paths;
                console.log(data);
                var group = new THREE.Group();

                console.log(paths);

                for (let x = 0; x < paths.length; x++) {


                    for (var i = 0; i < paths[x].subPaths.length; i++) {

                        var path = paths[x].subPaths[i];

                        const points = path.getPoints();

                        console.log(path);

                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        console.log(paths[x].userData);
                        const material = new THREE.LineBasicMaterial({color: paths[x].userData.style.stroke});

                        const line = new THREE.Line(geometry, material);
                        group.add(line);


                    }
                }
                // console.log(group);
                scene.add(group);
            }, (progress) => {

            },
            (error) => {
                console.log(error);
            });
    }

    var path = new THREE.Path();

    path.lineTo( 100, 100 );
    path.quadraticCurveTo( 0, 1, -200, 250 );
    path.lineTo( 1, 1 );

    var points = path.getPoints();

    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var material = new THREE.LineBasicMaterial( { color: 'red' } );

    var line = new THREE.Line( geometry, material );
    scene.add( line );







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
