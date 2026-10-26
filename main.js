import * as THREE from 'three';

// =============================================================================
// 核心场景管理器
// =============================================================================

class LinearAlgebraShow {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.currentScene = 0;
        this.isPlaying = false;
        this.sceneStartTime = 0;

        this.initRenderer();
        this.initScenes();
        this.initControls();
        this.animate();
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        // 主相机
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 10);

        // 响应式
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initScenes() {
        this.scenes = [
            new IntroScene(this.camera),
            new VectorFieldScene(this.camera),
            new MatrixTransformScene(this.camera),
            new EigenScene(this.camera),
            new ApplicationsScene(this.camera),
            new HighDimensionalScene(this.camera)
        ];

        // 隐藏loading
        document.getElementById('loading').style.display = 'none';
        document.getElementById('title-card').classList.add('visible');
    }

    initControls() {
        document.getElementById('play-btn').addEventListener('click', () => {
            this.togglePlay();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });

        // 键盘控制
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.togglePlay();
            } else if (e.code === 'ArrowRight') {
                this.nextScene();
            } else if (e.code === 'ArrowLeft') {
                this.previousScene();
            }
        });
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        const btn = document.getElementById('play-btn');
        btn.textContent = this.isPlaying ? '暂停' : '播放';

        if (this.isPlaying) {
            this.sceneStartTime = Date.now();
            document.getElementById('title-card').classList.remove('visible');
        }
    }

    restart() {
        this.currentScene = 0;
        this.isPlaying = false;
        this.sceneStartTime = 0;
        document.getElementById('play-btn').textContent = '播放';
        document.getElementById('title-card').classList.add('visible');
        document.getElementById('scene-label').classList.remove('visible');
        document.getElementById('progress-bar').style.width = '0%';

        this.scenes.forEach(scene => scene.reset());
    }

    nextScene() {
        if (this.currentScene < this.scenes.length - 1) {
            this.currentScene++;
            this.sceneStartTime = Date.now();
        }
    }

    previousScene() {
        if (this.currentScene > 0) {
            this.currentScene--;
            this.sceneStartTime = Date.now();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isPlaying) {
            const elapsed = (Date.now() - this.sceneStartTime) / 1000;
            const scene = this.scenes[this.currentScene];

            scene.update(elapsed);

            // 场景自动切换
            if (elapsed > scene.duration) {
                if (this.currentScene < this.scenes.length - 1) {
                    this.nextScene();
                } else {
                    this.isPlaying = false;
                    document.getElementById('play-btn').textContent = '播放';
                }
            }

            // 更新UI
            this.updateUI(scene, elapsed);
        }

        // 渲染当前场景
        const scene = this.scenes[this.currentScene];
        this.renderer.render(scene.scene, this.camera);
    }

    updateUI(scene, elapsed) {
        // 场景标签
        const label = document.getElementById('scene-label');
        label.textContent = scene.label;
        label.classList.add('visible');

        // 进度条
        const totalDuration = this.scenes.reduce((sum, s) => sum + s.duration, 0);
        const passedDuration = this.scenes.slice(0, this.currentScene)
            .reduce((sum, s) => sum + s.duration, 0) + elapsed;
        const progress = (passedDuration / totalDuration) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
    }
}

// =============================================================================
// Scene 1: 开场 - 从点到向量
// =============================================================================

class IntroScene {
    constructor(camera) {
        this.camera = camera;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x05070C, 5, 50);
        this.duration = 5;
        this.label = "从点到向量，从数到空间";

        this.init();
    }

    init() {
        // 环境光
        const ambient = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambient);

        // 粒子系统 - 代表离散的点
        const particlesGeometry = new THREE.BufferGeometry();
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // 初始随机分布
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            // 青色到翠绿色渐变
            const t = Math.random();
            colors[i * 3] = 0.22 * (1 - t) + 0.43 * t;      // R
            colors[i * 3 + 1] = 0.74 * (1 - t) + 0.91 * t;  // G
            colors[i * 3 + 2] = 0.97 * (1 - t) + 0.72 * t;  // B
        }

        particlesGeometry.setAttribute('position',
            new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color',
            new THREE.BufferAttribute(colors, 3));

        this.initialPositions = positions.slice();

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }

    update(t) {
        // 前2秒：粒子聚集成网格
        // 后3秒：网格扭曲，暗示变换
        const positions = this.particles.geometry.attributes.position.array;

        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            const initialX = this.initialPositions[i3];
            const initialY = this.initialPositions[i3 + 1];
            const initialZ = this.initialPositions[i3 + 2];

            if (t < 2) {
                // 聚集成网格
                const progress = Math.min(t / 2, 1);
                const eased = this.easeInOutCubic(progress);

                const gridX = Math.round(initialX / 2) * 2;
                const gridY = Math.round(initialY / 2) * 2;
                const gridZ = Math.round(initialZ / 2) * 2;

                positions[i3] = initialX + (gridX - initialX) * eased;
                positions[i3 + 1] = initialY + (gridY - initialY) * eased;
                positions[i3 + 2] = initialZ + (gridZ - initialZ) * eased;
            } else {
                // 扭曲
                const t2 = t - 2;
                const angle = t2 * 0.3;
                const x = positions[i3];
                const y = positions[i3 + 1];

                positions[i3] = x * Math.cos(angle) - y * Math.sin(angle);
                positions[i3 + 1] = x * Math.sin(angle) + y * Math.cos(angle);
            }
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.rotation.y = t * 0.1;

        // 相机运动
        this.camera.position.z = 10 - t * 0.3;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    reset() {
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i++) {
            positions[i] = this.initialPositions[i];
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.rotation.y = 0;
        this.camera.position.set(0, 0, 10);
    }
}

// =============================================================================
// Scene 2: 向量场 - 流动的力量
// =============================================================================

class VectorFieldScene {
    constructor(camera) {
        this.camera = camera;
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x05070C, 10, 50);
        this.duration = 8;
        this.label = "向量场：看见力的流动";

        this.init();
    }

    init() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        // 创建向量场
        this.arrows = [];
        const gridSize = 15;
        const spacing = 1.5;

        for (let x = -gridSize / 2; x < gridSize / 2; x++) {
            for (let y = -gridSize / 2; y < gridSize / 2; y++) {
                for (let z = -gridSize / 2; z < gridSize / 2; z++) {
                    if (Math.random() > 0.7) { // 稀疏一些
                        const origin = new THREE.Vector3(
                            x * spacing,
                            y * spacing,
                            z * spacing
                        );

                        const dir = new THREE.Vector3(0, 1, 0);
                        const length = 0.8;
                        const color = 0x38BDF8;

                        const arrow = new THREE.ArrowHelper(
                            dir, origin, length, color, 0.3, 0.2
                        );
                        arrow.userData.origin = origin.clone();
                        this.scene.add(arrow);
                        this.arrows.push(arrow);
                    }
                }
            }
        }

        // 添加流线粒子
        const particlesGeometry = new THREE.BufferGeometry();
        const count = 1000;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }

        particlesGeometry.setAttribute('position',
            new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.08,
            color: 0x6EE7B7,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.flowParticles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.flowParticles);
    }

    update(t) {
        // 向量场动画 - 螺旋、收缩、扩张
        this.arrows.forEach((arrow) => {
            const origin = arrow.userData.origin;
            const x = origin.x;
            const y = origin.y;
            const z = origin.z;

            // 时变向量场
            let vx, vy, vz;

            if (t < 3) {
                // 旋转场
                vx = -y;
                vy = x;
                vz = Math.sin(t) * z * 0.3;
            } else if (t < 6) {
                // 收缩场
                const r = Math.sqrt(x * x + y * y + z * z);
                vx = -x / (r + 0.1);
                vy = -y / (r + 0.1);
                vz = -z / (r + 0.1);
            } else {
                // 扩张场
                vx = x * 0.5;
                vy = y * 0.5;
                vz = z * 0.5 + Math.cos(t * 2) * 0.5;
            }

            const direction = new THREE.Vector3(vx, vy, vz).normalize();
            arrow.setDirection(direction);

            // 长度随时间脉动
            const length = 0.8 + Math.sin(t * 3 + x + y) * 0.3;
            arrow.setLength(length, 0.3, 0.2);
        });

        // 粒子沿向量场流动
        const positions = this.flowParticles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            let x = positions[i3];
            let y = positions[i3 + 1];
            let z = positions[i3 + 2];

            // 根据向量场更新位置
            let vx, vy, vz;
            if (t < 3) {
                vx = -y * 0.02;
                vy = x * 0.02;
                vz = Math.sin(t) * z * 0.01;
            } else if (t < 6) {
                const r = Math.sqrt(x * x + y * y + z * z);
                vx = -x / (r + 0.1) * 0.02;
                vy = -y / (r + 0.1) * 0.02;
                vz = -z / (r + 0.1) * 0.02;
            } else {
                vx = x * 0.01;
                vy = y * 0.01;
                vz = z * 0.01;
            }

            positions[i3] += vx;
            positions[i3 + 1] += vy;
            positions[i3 + 2] += vz;

            // 边界重置
            if (Math.abs(positions[i3]) > 15 ||
                Math.abs(positions[i3 + 1]) > 15 ||
                Math.abs(positions[i3 + 2]) > 15) {
                positions[i3] = (Math.random() - 0.5) * 10;
                positions[i3 + 1] = (Math.random() - 0.5) * 10;
                positions[i3 + 2] = (Math.random() - 0.5) * 10;
            }
        }
        this.flowParticles.geometry.attributes.position.needsUpdate = true;

        // 相机环绕
        const radius = 15;
        this.camera.position.x = Math.cos(t * 0.2) * radius;
        this.camera.position.z = Math.sin(t * 0.2) * radius;
        this.camera.position.y = Math.sin(t * 0.3) * 5;
        this.camera.lookAt(0, 0, 0);
    }

    reset() {
        this.camera.position.set(0, 0, 10);
    }
}

// =============================================================================
// Scene 3: 矩阵变换 - 空间的重塑
// =============================================================================

class MatrixTransformScene {
    constructor(camera) {
        this.camera = camera;
        this.scene = new THREE.Scene();
        this.duration = 10;
        this.label = "矩阵变换：空间如何被重塑";

        this.init();
    }

    init() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);

        // 创建网格立方体
        const gridSize = 8;
        this.cubes = [];

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                for (let z = 0; z < gridSize; z++) {
                    const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
                    const material = new THREE.MeshStandardMaterial({
                        color: 0x38BDF8,
                        emissive: 0x38BDF8,
                        emissiveIntensity: 0.3,
                        metalness: 0.8,
                        roughness: 0.2
                    });

                    const cube = new THREE.Mesh(geometry, material);

                    // 初始位置（中心化）
                    const offset = (gridSize - 1) / 2;
                    cube.userData.originalPos = new THREE.Vector3(
                        (x - offset) * 1.5,
                        (y - offset) * 1.5,
                        (z - offset) * 1.5
                    );

                    cube.position.copy(cube.userData.originalPos);
                    this.scene.add(cube);
                    this.cubes.push(cube);
                }
            }
        }

        // 添加坐标轴
        const axesHelper = new THREE.AxesHelper(10);
        axesHelper.material.transparent = true;
        axesHelper.material.opacity = 0.3;
        this.scene.add(axesHelper);
    }

    update(t) {
        // 0-3s: 旋转变换
        // 3-6s: 缩放变换
        // 6-8s: 错切变换
        // 8-10s: 复合变换

        this.cubes.forEach(cube => {
            const orig = cube.userData.originalPos;
            let x = orig.x;
            let y = orig.y;
            let z = orig.z;

            let matrix = new THREE.Matrix4();

            if (t < 3) {
                // 绕Y轴旋转
                const angle = (t / 3) * Math.PI / 2;
                matrix.makeRotationY(angle);
            } else if (t < 6) {
                // 非均匀缩放
                const t2 = (t - 3) / 3;
                const sx = 1 + Math.sin(t2 * Math.PI) * 0.5;
                const sy = 1;
                const sz = 1 - Math.sin(t2 * Math.PI) * 0.3;
                matrix.makeScale(sx, sy, sz);
            } else if (t < 8) {
                // 错切
                const t3 = (t - 6) / 2;
                const shear = Math.sin(t3 * Math.PI) * 0.5;
                matrix.set(
                    1, shear, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                );
            } else {
                // 复合变换：旋转 + 缩放 + 平移
                const t4 = (t - 8) / 2;
                const angle = t4 * Math.PI;
                matrix.makeRotationAxis(
                    new THREE.Vector3(1, 1, 0).normalize(),
                    angle
                );
                const scale = 1 + Math.sin(t4 * Math.PI * 2) * 0.3;
                matrix.scale(new THREE.Vector3(scale, scale, scale));
            }

            const pos = new THREE.Vector3(x, y, z);
            pos.applyMatrix4(matrix);

            cube.position.copy(pos);

            // 颜色变化
            const hue = (t / this.duration + (x + y + z) * 0.02) % 1;
            const color = new THREE.Color().setHSL(hue * 0.3 + 0.5, 0.8, 0.5);
            cube.material.color = color;
            cube.material.emissive = color;
        });

        // 相机缓慢旋转
        const radius = 20;
        this.camera.position.x = Math.cos(t * 0.15) * radius;
        this.camera.position.y = Math.sin(t * 0.1) * 10 + 5;
        this.camera.position.z = Math.sin(t * 0.15) * radius;
        this.camera.lookAt(0, 0, 0);
    }

    reset() {
        this.cubes.forEach(cube => {
            cube.position.copy(cube.userData.originalPos);
            cube.material.color.setHex(0x38BDF8);
            cube.material.emissive.setHex(0x38BDF8);
        });
        this.camera.position.set(0, 0, 10);
    }
}

// =============================================================================
// Scene 4: 特征向量 - 不变的灵魂
// =============================================================================

class EigenScene {
    constructor(camera) {
        this.camera = camera;
        this.scene = new THREE.Scene();
        this.duration = 8;
        this.label = "特征向量：变换中不变的方向";

        this.init();
    }

    init() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        // 创建椭圆形粒子云
        const particlesGeometry = new THREE.BufferGeometry();
        const count = 3000;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // 球形分布
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 5 + Math.random() * 2;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            // 初始白色
            colors[i * 3] = 1;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;
        }

        particlesGeometry.setAttribute('position',
            new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color',
            new THREE.BufferAttribute(colors, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);

        // 特征向量箭头
        this.eigenArrows = [];

        // 主特征向量（红色）
        const arrow1 = new THREE.ArrowHelper(
            new THREE.Vector3(1, 0, 0).normalize(),
            new THREE.Vector3(0, 0, 0),
            8,
            0xFF6B6B,
            1.5,
            1
        );
        arrow1.line.material.linewidth = 3;
        this.scene.add(arrow1);
        this.eigenArrows.push(arrow1);

        // 次特征向量（黄色）
        const arrow2 = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0).normalize(),
            new THREE.Vector3(0, 0, 0),
            6,
            0xFECA57,
            1.2,
            0.8
        );
        this.scene.add(arrow2);
        this.eigenArrows.push(arrow2);

        // 最小特征向量（蓝色）
        const arrow3 = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1).normalize(),
            new THREE.Vector3(0, 0, 0),
            4,
            0x48DBF8,
            1,
            0.6
        );
        this.scene.add(arrow3);
        this.eigenArrows.push(arrow3);

        this.initialPositions = positions.slice();
    }

    update(t) {
        const positions = this.particles.geometry.attributes.position.array;
        const colors = this.particles.geometry.attributes.color.array;

        // 应用非均匀缩放矩阵（对角矩阵，特征值为3, 2, 1）
        const lambda1 = 3;
        const lambda2 = 2;
        const lambda3 = 1;

        const progress = Math.min(t / 4, 1);
        const eased = this.easeInOutCubic(progress);

        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            const x0 = this.initialPositions[i3];
            const y0 = this.initialPositions[i3 + 1];
            const z0 = this.initialPositions[i3 + 2];

            // 沿特征方向缩放
            const x = x0 * (1 + (lambda1 - 1) * eased);
            const y = y0 * (1 + (lambda2 - 1) * eased);
            const z = z0 * (1 + (lambda3 - 1) * eased);

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            // 根据与特征向量的接近程度着色
            const dx = Math.abs(x0) / (Math.abs(y0) + Math.abs(z0) + 0.1);
            const dy = Math.abs(y0) / (Math.abs(x0) + Math.abs(z0) + 0.1);
            const dz = Math.abs(z0) / (Math.abs(x0) + Math.abs(y0) + 0.1);

            colors[i3] = dx * 0.8 + 0.2;     // 更接近X轴更红
            colors[i3 + 1] = dy * 0.8 + 0.2; // 更接近Y轴更绿
            colors[i3 + 2] = dz * 0.8 + 0.2; // 更接近Z轴更蓝
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.color.needsUpdate = true;

        // 特征向量箭头脉动
        this.eigenArrows.forEach((arrow, idx) => {
            const scale = 1 + Math.sin(t * 2 + idx) * 0.2;
            const baseLength = [8, 6, 4][idx];
            arrow.setLength(baseLength * scale);
        });

        // 相机运动
        const radius = 18;
        this.camera.position.x = Math.cos(t * 0.2) * radius;
        this.camera.position.y = Math.sin(t * 0.15) * 8;
        this.camera.position.z = Math.sin(t * 0.2) * radius;
        this.camera.lookAt(0, 0, 0);
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    reset() {
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i++) {
            positions[i] = this.initialPositions[i];
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
        this.camera.position.set(0, 0, 10);
    }
}

// =============================================================================
// Scene 5: 现实应用 - 从理论到世界
// =============================================================================

class ApplicationsScene {
    constructor(camera) {
        this.camera = camera;
        this.scene = new THREE.Scene();
        this.duration = 10;
        this.label = "现实应用：3D渲染 · 人脸识别 · 神经网络 · 量子计算";

        this.init();
    }

    init() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambient);

        const pointLight = new THREE.PointLight(0x38BDF8, 2, 50);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);

        // 应用1: 3D渲染 - 旋转的立方体网格
        this.renderCubes = [];
        for (let i = 0; i < 3; i++) {
            const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
            const edges = new THREE.EdgesGeometry(geometry);
            const material = new THREE.LineBasicMaterial({
                color: 0x38BDF8,
                linewidth: 2
            });
            const cube = new THREE.LineSegments(edges, material);
            cube.position.set(-8, 3, i * 3 - 3);
            this.scene.add(cube);
            this.renderCubes.push(cube);
        }

        // 应用2: 人脸识别 - 人脸网格
        this.facePoints = [];
        const faceGeometry = new THREE.SphereGeometry(2, 16, 16);
        const faceVertices = faceGeometry.attributes.position.array;

        for (let i = 0; i < faceVertices.length; i += 3) {
            const geometry = new THREE.SphereGeometry(0.05, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0x6EE7B7,
                transparent: true,
                opacity: 0.8
            });
            const point = new THREE.Mesh(geometry, material);
            point.position.set(
                faceVertices[i],
                faceVertices[i + 1],
                faceVertices[i + 2]
            );
            point.userData.originalPos = point.position.clone();
            this.scene.add(point);
            this.facePoints.push(point);
        }

        // 将人脸群组移到右侧
        this.faceGroup = new THREE.Group();
        this.facePoints.forEach(p => this.faceGroup.add(p));
        this.faceGroup.position.set(0, 2, 0);
        this.scene.add(this.faceGroup);

        // 应用3: 神经网络 - 层状连接
        this.neuralLayers = [];
        const layerSizes = [8, 12, 12, 8, 4];
        const layerSpacing = 3;

        for (let l = 0; l < layerSizes.length; l++) {
            const layer = [];
            for (let n = 0; n < layerSizes[l]; n++) {
                const geometry = new THREE.SphereGeometry(0.15, 16, 16);
                const material = new THREE.MeshStandardMaterial({
                    color: 0xFECA57,
                    emissive: 0xFECA57,
                    emissiveIntensity: 0.5
                });
                const neuron = new THREE.Mesh(geometry, material);

                const offset = (layerSizes[l] - 1) / 2;
                neuron.position.set(
                    (l - 2) * layerSpacing,
                    (n - offset) * 0.8,
                    -8
                );
                this.scene.add(neuron);
                layer.push(neuron);
            }
            this.neuralLayers.push(layer);
        }

        // 神经网络连接线
        this.connections = [];
        for (let l = 0; l < this.neuralLayers.length - 1; l++) {
            for (let i = 0; i < this.neuralLayers[l].length; i++) {
                for (let j = 0; j < this.neuralLayers[l + 1].length; j++) {
                    if (Math.random() > 0.5) { // 稀疏连接
                        const material = new THREE.LineBasicMaterial({
                            color: 0xFECA57,
                            transparent: true,
                            opacity: 0.1
                        });
                        const points = [
                            this.neuralLayers[l][i].position,
                            this.neuralLayers[l + 1][j].position
                        ];
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        const line = new THREE.Line(geometry, material);
                        this.scene.add(line);
                        this.connections.push(line);
                    }
                }
            }
        }

        // 应用4: 量子态 - 布洛赫球
        const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x38BDF8,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        this.blochSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        this.blochSphere.position.set(8, -2, 0);
        this.scene.add(this.blochSphere);

        // 量子态向量
        this.stateVector = new THREE.ArrowHelper(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(8, -2, 0),
            1.5,
            0xFF6B6B,
            0.4,
            0.3
        );
        this.scene.add(this.stateVector);
    }

    update(t) {
        // 应用1: 3D渲染动画
        this.renderCubes.forEach((cube, idx) => {
            cube.rotation.x = t * 0.5 + idx;
            cube.rotation.y = t * 0.7 + idx;
            cube.rotation.z = t * 0.3 + idx;
        });

        // 应用2: 人脸识别 - PCA降维效果
        const morphProgress = (Math.sin(t * 0.8) + 1) / 2;
        this.facePoints.forEach((point, idx) => {
            const orig = point.userData.originalPos;
            // 模拟主成分
            const pc1 = Math.sin(idx * 0.1) * morphProgress;
            const pc2 = Math.cos(idx * 0.1) * morphProgress;

            point.position.x = orig.x + pc1 * 0.5;
            point.position.y = orig.y + pc2 * 0.3;
        });
        this.faceGroup.rotation.y = t * 0.3;

        // 应用3: 神经网络前向传播
        this.neuralLayers.forEach((layer, l) => {
            layer.forEach((neuron, n) => {
                const activation = Math.sin(t * 2 + l * 0.5 + n * 0.1);
                const intensity = (activation + 1) / 2;
                neuron.material.emissiveIntensity = 0.2 + intensity * 0.8;
                neuron.scale.setScalar(0.8 + intensity * 0.4);
            });
        });

        // 连接线脉冲
        this.connections.forEach((line, idx) => {
            const pulse = Math.sin(t * 3 + idx * 0.1);
            line.material.opacity = 0.05 + (pulse + 1) / 2 * 0.15;
        });

        // 应用4: 量子态演化
        const theta = t * 0.5;
        const phi = t * 0.7;
        const direction = new THREE.Vector3(
            Math.sin(theta) * Math.cos(phi),
            Math.cos(theta),
            Math.sin(theta) * Math.sin(phi)
        );
        this.stateVector.setDirection(direction);
        this.blochSphere.rotation.y = t * 0.2;

        // 相机巡游各个应用
        const segment = (t % 10) / 10;
        let targetX = 0;
        let targetY = 0;
        let targetZ = 0;

        if (segment < 0.25) {
            // 看3D渲染
            targetX = -8;
            targetY = 3;
        } else if (segment < 0.5) {
            // 看人脸识别
            targetX = 0;
            targetY = 2;
        } else if (segment < 0.75) {
            // 看神经网络
            targetX = 0;
            targetY = 0;
            targetZ = -8;
        } else {
            // 看量子态
            targetX = 8;
            targetY = -2;
        }

        const camRadius = 12;
        const camAngle = t * 0.2;
        this.camera.position.x = targetX + Math.cos(camAngle) * camRadius * 0.5;
        this.camera.position.y = targetY + 5;
        this.camera.position.z = targetZ + Math.sin(camAngle) * camRadius * 0.5 + 10;
        this.camera.lookAt(targetX, targetY, targetZ);
    }

    reset() {
        this.camera.position.set(0, 0, 10);
    }
}

// =============================================================================
// Scene 6: 高维投影 - Finale
// =============================================================================

class HighDimensionalScene {
    constructor(camera) {
        this.camera = camera;
        this.scene = new THREE.Scene();
        this.duration = 12;
        this.label = "高维空间：投影出的美丽图案";

        this.init();
    }

    init() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        // 4D超立方体投影到3D
        this.hypercubePoints = [];
        this.hypercubeEdges = [];

        // 生成4D超立方体的顶点 (16个顶点)
        const vertices4D = [];
        for (let i = 0; i < 16; i++) {
            vertices4D.push([
                (i & 1) ? 1 : -1,
                (i & 2) ? 1 : -1,
                (i & 4) ? 1 : -1,
                (i & 8) ? 1 : -1
            ]);
        }

        // 创建顶点球
        vertices4D.forEach((v4d) => {
            const geometry = new THREE.SphereGeometry(0.15, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color: 0x38BDF8,
                emissive: 0x38BDF8,
                emissiveIntensity: 0.7
            });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.userData.coords4D = v4d;
            this.scene.add(sphere);
            this.hypercubePoints.push(sphere);
        });

        // 连接边（4D超立方体有32条边）
        for (let i = 0; i < 16; i++) {
            for (let j = i + 1; j < 16; j++) {
                // 只连接汉明距离为1的顶点
                const diff = i ^ j;
                if ((diff & (diff - 1)) === 0) { // 2的幂
                    const material = new THREE.LineBasicMaterial({
                        color: 0x6EE7B7,
                        transparent: true,
                        opacity: 0.4
                    });
                    const points = [
                        this.hypercubePoints[i].position,
                        this.hypercubePoints[j].position
                    ];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, material);
                    line.userData.indices = [i, j];
                    this.scene.add(line);
                    this.hypercubeEdges.push(line);
                }
            }
        }

        // 添加粒子轨迹
        const trailGeometry = new THREE.BufferGeometry();
        const trailCount = 500;
        const trailPositions = new Float32Array(trailCount * 3);
        const trailColors = new Float32Array(trailCount * 3);

        for (let i = 0; i < trailCount; i++) {
            trailPositions[i * 3] = 0;
            trailPositions[i * 3 + 1] = 0;
            trailPositions[i * 3 + 2] = 0;

            const t = i / trailCount;
            trailColors[i * 3] = 0.22 + t * 0.4;
            trailColors[i * 3 + 1] = 0.74 + t * 0.17;
            trailColors[i * 3 + 2] = 0.97 - t * 0.25;
        }

        trailGeometry.setAttribute('position',
            new THREE.BufferAttribute(trailPositions, 3));
        trailGeometry.setAttribute('color',
            new THREE.BufferAttribute(trailColors, 3));

        const trailMaterial = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.trail = new THREE.Points(trailGeometry, trailMaterial);
        this.scene.add(this.trail);
        this.trailIndex = 0;
    }

    update(t) {
        // 4D旋转矩阵（在XW和YZ平面旋转）
        const angleXW = t * 0.3;
        const angleYZ = t * 0.5;

        this.hypercubePoints.forEach((point, idx) => {
            const [x, y, z, w] = point.userData.coords4D;

            // 4D旋转
            const x1 = x * Math.cos(angleXW) - w * Math.sin(angleXW);
            const w1 = x * Math.sin(angleXW) + w * Math.cos(angleXW);

            const y1 = y * Math.cos(angleYZ) - z * Math.sin(angleYZ);
            const z1 = y * Math.sin(angleYZ) + z * Math.cos(angleYZ);

            // 透视投影到3D（简单除法）
            const distance = 4;
            const scale = distance / (distance + w1);

            point.position.set(
                x1 * scale * 3,
                y1 * scale * 3,
                z1 * scale * 3
            );

            // 根据W坐标调整大小
            const size = 0.8 + scale * 0.4;
            point.scale.setScalar(size);
        });

        // 更新边
        this.hypercubeEdges.forEach(line => {
            const [i, j] = line.userData.indices;
            const points = [
                this.hypercubePoints[i].position.clone(),
                this.hypercubePoints[j].position.clone()
            ];
            line.geometry.setFromPoints(points);
        });

        // 粒子轨迹跟随一个顶点
        const trackedPoint = this.hypercubePoints[0].position;
        const trailPositions = this.trail.geometry.attributes.position.array;

        this.trailIndex = (this.trailIndex + 1) % (trailPositions.length / 3);
        trailPositions[this.trailIndex * 3] = trackedPoint.x;
        trailPositions[this.trailIndex * 3 + 1] = trackedPoint.y;
        trailPositions[this.trailIndex * 3 + 2] = trackedPoint.z;

        this.trail.geometry.attributes.position.needsUpdate = true;

        // 相机运动 - 最终的环绕
        const radius = 15;
        const height = Math.sin(t * 0.1) * 5;
        this.camera.position.x = Math.cos(t * 0.25) * radius;
        this.camera.position.y = height + 3;
        this.camera.position.z = Math.sin(t * 0.25) * radius;
        this.camera.lookAt(0, 0, 0);

        // Finale效果：逐渐增加光芒
        if (t > 8) {
            const glowIntensity = (t - 8) / 4;
            this.hypercubePoints.forEach(point => {
                point.material.emissiveIntensity = 0.7 + glowIntensity * 0.3;
            });
        }
    }

    reset() {
        this.camera.position.set(0, 0, 10);
        this.trailIndex = 0;
    }
}

// =============================================================================
// 启动
// =============================================================================

window.addEventListener('DOMContentLoaded', () => {
    new LinearAlgebraShow();
});

