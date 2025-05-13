<template>
  <div class="container">
    <canvas ref="canvas" class="gear-canvas"></canvas>
    <div ref="textContainer" class="text-overlay">
      <h1 class="title" ref="title">RepairHub</h1>
      <p class="description" ref="description"></p>
      <el-button type="primary" size="large" class="experience-btn" @click="goToLogin">立即体验</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMouse } from '@vueuse/core'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

// 初始化
const canvas = ref<HTMLCanvasElement | null>(null)
const title = ref<HTMLElement | null>(null)
const description = ref<HTMLElement | null>(null)
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, outerGear: THREE.Group, innerGear: THREE.Group

// 齿轮参数
const OUTER_GEAR_CONFIG = {
  radius: 12,
  thickness: 2,
  toothCount: 48,
  toothSize: 2
}

const INNER_GEAR_CONFIG = {
  radius: 6,
  thickness: 2,
  toothCount: 24,
  toothSize: 1
}

// 创建线框齿轮
const createGear = (config: typeof OUTER_GEAR_CONFIG, isHollow = false) => {
  const group = new THREE.Group()
  const material = new THREE.LineBasicMaterial({ color: 0x333333 })
  
  // 齿轮轮廓
  const outlinePoints = []
  for(let i = 0; i <= config.toothCount; i++) {
    const angle = (i / config.toothCount) * Math.PI * 2
    // 齿轮外圈点
    outlinePoints.push(
      new THREE.Vector3(
        Math.cos(angle) * (config.radius + config.toothSize),
        Math.sin(angle) * (config.radius + config.toothSize),
        config.thickness/2
      )
    )
    // 齿轮内圈点
    if (i < config.toothCount) {
      const innerAngle = ((i + 0.5) / config.toothCount) * Math.PI * 2
      outlinePoints.push(
        new THREE.Vector3(
          Math.cos(innerAngle) * config.radius,
          Math.sin(innerAngle) * config.radius,
          config.thickness/2
        )
      )
    }
  }
  
  const outlineGeometry = new THREE.BufferGeometry().setFromPoints(outlinePoints)
  const outline = new THREE.Line(outlineGeometry, material)
  group.add(outline)
  
  // 创建对称面
  const bottomOutline = outline.clone()
  bottomOutline.position.z = -config.thickness
  group.add(bottomOutline)
  
  // 如果是镂空齿轮，添加内圈
  if (isHollow) {
    const innerRadius = config.radius * 0.6
    const innerPoints = []
    for(let i = 0; i <= 32; i++) {
      const angle = (i / 32) * Math.PI * 2
      innerPoints.push(
        new THREE.Vector3(
          Math.cos(angle) * innerRadius,
          Math.sin(angle) * innerRadius,
          config.thickness/2
        )
      )
    }
    const innerGeometry = new THREE.BufferGeometry().setFromPoints(innerPoints)
    const innerOutline = new THREE.Line(innerGeometry, material)
    group.add(innerOutline)
    
    const bottomInnerOutline = innerOutline.clone()
    bottomInnerOutline.position.z = -config.thickness
    group.add(bottomInnerOutline)
  }

  return group
}

onMounted(() => {
  // 场景初始化
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ 
    canvas: canvas.value!,
    antialias: true,
    alpha: true
  })
  renderer.setClearColor(0xffffff)
  renderer.setSize(window.innerWidth, window.innerHeight)

  // 光源设置
  const light1 = new THREE.DirectionalLight(0xffffff, 1.5)
  light1.position.set(1, 1, 1)
  scene.add(light1)
  
  const light2 = new THREE.DirectionalLight(0xffffff, 0.8)
  light2.position.set(-1, -1, -1)
  scene.add(light2)
  
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
  scene.add(ambientLight)

  // 创建齿轮
  outerGear = createGear(OUTER_GEAR_CONFIG)
  innerGear = createGear(INNER_GEAR_CONFIG, true)
  scene.add(outerGear)
  scene.add(innerGear)
  camera.position.z = 30

  // 鼠标交互
  const { x, y } = useMouse()
  const onMouseMove = () => {
    const rotationFactor = 0.00002
    outerGear.rotation.x += (y.value - window.innerHeight/2) * rotationFactor
    outerGear.rotation.y += (x.value - window.innerWidth/2) * rotationFactor
    innerGear.rotation.x -= (y.value - window.innerHeight/2) * rotationFactor
    innerGear.rotation.y -= (x.value - window.innerWidth/2) * rotationFactor
  }
  window.addEventListener('mousemove', onMouseMove)

  // 滚轮交互
  let wheelCount = 0
  const texts = [
    { text: "专业的设备维修管理系统，为您提供全方位的维修解决方案", direction: "top" },
    { text: "智能分配维修任务，实时追踪维修进度", direction: "right" },
    { text: "数据驱动决策，提升维修效率", direction: "bottom" }
  ]

  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    const rotationAmount = Math.PI / 4 // 45度

    // 齿轮旋转动画
    gsap.to(outerGear.rotation, {
      x: outerGear.rotation.x + rotationAmount,
      y: outerGear.rotation.y + rotationAmount,
      z: outerGear.rotation.z + rotationAmount,
      duration: 1,
      ease: "power2.out"
    })

    gsap.to(innerGear.rotation, {
      x: innerGear.rotation.x - rotationAmount,
      y: innerGear.rotation.y - rotationAmount,
      z: innerGear.rotation.z - rotationAmount,
      duration: 1,
      ease: "power2.out"
    })

    // 文字动画
    wheelCount = (wheelCount + 1) % 3
    if (description.value) {
      const currentText = texts[wheelCount]
      description.value.textContent = currentText.text

      // 根据方向设置动画起始位置
      const animationConfig = {
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      }

      switch (currentText.direction) {
        case "top":
          animationConfig["y"] = -50
          break
        case "right":
          animationConfig["x"] = 50
          break
        case "bottom":
          animationConfig["y"] = 50
          break
      }

      gsap.fromTo(description.value,
        { opacity: 0, x: 0, y: 0 },
        { ...animationConfig, opacity: 1, x: 0, y: 0 }
      )
    }
  }
  window.addEventListener('wheel', onWheel, { passive: false })

  // 初始文字动画
  gsap.from(title.value, {
    opacity: 0,
    y: -50,
    duration: 1.5,
    ease: "back.out(2)"
  })

  if (description.value) {
    description.value.textContent = texts[0].text
    gsap.from(description.value, {
      opacity: 0,
      y: 50,
      duration: 1.5,
      delay: 0.3,
      ease: "back.out(2)"
    })
  }

  // 按钮动画
  const experienceBtn = document.querySelector('.experience-btn')
  if (experienceBtn) {
    gsap.from(experienceBtn, {
      opacity: 0,
      y: 50,
      duration: 1.5,
      delay: 0.6,
      ease: "back.out(2)"
    })
  }

  // 渲染循环
  const animate = () => {
    requestAnimationFrame(animate)
    outerGear.rotation.z += 0.002
    innerGear.rotation.z -= 0.003
    renderer.render(scene, camera)
  }
  animate()
})
</script>

<style scoped>
.container {
  position: relative;
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
}

.gear-canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
}

.text-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #000;
  z-index: 2;
  width: 80%;
}

.title {
  font-size: 5rem;
  margin-bottom: 2rem;
  font-weight: 700;
  letter-spacing: -0.05em;
}

.description {
  font-size: 1.8rem;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  margin-bottom: 3rem;
}

.experience-btn {
  font-size: 1.2rem;
  padding: 12px 36px;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.3s ease;
}

.experience-btn:hover {
  transform: translateY(-2px);
}
</style>