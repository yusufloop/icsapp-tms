import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  Dimensions,
  PanResponder,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

// Simple UUID generator for Expo compatibility
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface Box {
  id: string;
  width: number;
  length: number;
  height: number;
  position: { x: number; y: number; z: number };
  color: string;
  isLocked: boolean;
  isSelected: boolean;
  isEditing: boolean;
  isFragile: boolean;
}

interface Container {
  name: string;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
}

const CONTAINERS: Record<string, Container> = {
  '20ft': {
    name: '20ft Container',
    dimensions: { width: 2.35, length: 5.9, height: 2.39 },
  },
  '40ft': {
    name: '40ft Container',
    dimensions: { width: 2.35, length: 12.03, height: 2.39 },
  },
};

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function ContainerPackerScreen() {
  const [containerType, setContainerType] = useState<'20ft' | '40ft'>('20ft');
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [isFragile, setIsFragile] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const animationFrameRef = useRef<number>();

  const [cameraPosition, setCameraPosition] = useState({ 
    radius: 12, 
    theta: Math.PI / 4, 
    phi: Math.PI / 3 
  });
  const [isDragging, setIsDragging] = useState(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const glViewRef = useRef<any>(null);
  const [glViewLayout, setGlViewLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const getTopSurfaceY = (x: number, z: number, excludeBoxId?: string): number => {
    let maxY = 0; // Floor level

    for (const box of boxes) {
      if (box.id === excludeBoxId) continue;

      const boxMinX = box.position.x - box.width / 2;
      const boxMaxX = box.position.x + box.width / 2;
      const boxMinZ = box.position.z - box.length / 2;
      const boxMaxZ = box.position.z + box.length / 2;

      // Check if the point (x, z) is within this box's footprint
      if (x >= boxMinX && x <= boxMaxX && z >= boxMinZ && z <= boxMaxZ) {
        const boxTopY = box.position.y + box.height / 2;
        maxY = Math.max(maxY, boxTopY);
      }
    }

    return maxY;
  };

  const canStackOnBox = (bottomBox: Box, topBoxHeight: number): boolean => {
    const container = CONTAINERS[containerType];
    const stackedHeight = bottomBox.position.y + bottomBox.height / 2 + topBoxHeight;
    return stackedHeight <= container.dimensions.height;
  };

  const findOptimalPosition = (
    boxWidth: number, 
    boxLength: number, 
    boxHeight: number, 
    containerDims: { width: number; length: number; height: number },
    boxIsFragile: boolean = false
  ): { x: number; y: number; z: number } | null => {
    const stepSize = 0.1; // 10cm precision
    
    const minX = -containerDims.width / 2;
    const maxX = containerDims.width / 2;
    const minZ = -containerDims.length / 2;
    const maxZ = containerDims.length / 2;

    // Try all possible Y levels (floor + existing box tops)
    const possibleYLevels = [0]; // Start with floor
    
    // Add all existing box top surfaces as possible Y levels
    for (const box of boxes) {
      if (canStackOnBox(box, boxHeight)) {
        // Fragile boxes can only stack on non-fragile boxes
        if (boxIsFragile && box.isFragile) continue;
        
        const topY = box.position.y + box.height / 2;
        if (!possibleYLevels.includes(topY)) {
          possibleYLevels.push(topY);
        }
      }
    }

    possibleYLevels.sort((a, b) => a - b); // Sort from lowest to highest

    // Try each Y level
    for (const baseY of possibleYLevels) {
      const boxY = baseY + boxHeight / 2;
      
      // Check if box would exceed container height
      if (boxY + boxHeight / 2 > containerDims.height) {
        continue;
      }

      // Try positions at this Y level
      for (let z = minZ; z <= maxZ - boxLength; z += stepSize) {
        for (let x = minX; x <= maxX - boxWidth; x += stepSize) {
          const centerX = x + boxWidth / 2;
          const centerZ = z + boxLength / 2;
          
          if (isPositionValid(centerX, boxY, centerZ, boxWidth, boxLength, boxHeight)) {
            return { x: centerX, y: boxY, z: centerZ };
          }
        }
      }
    }

    return null;
  };

  const isPositionValid = (
    x: number, 
    y: number, 
    z: number, 
    width: number, 
    length: number, 
    height: number,
    excludeBoxId?: string
  ): boolean => {
    const container = CONTAINERS[containerType];
    
    // Check container bounds
    const minX = -container.dimensions.width / 2;
    const maxX = container.dimensions.width / 2;
    const minZ = -container.dimensions.length / 2;
    const maxZ = container.dimensions.length / 2;

    if (x - width / 2 < minX || x + width / 2 > maxX || 
        z - length / 2 < minZ || z + length / 2 > maxZ ||
        y + height / 2 > container.dimensions.height) {
      return false;
    }

    // Check for overlaps with existing boxes
    for (const box of boxes) {
      if (box.id === excludeBoxId) continue;

      const dx = Math.abs(x - box.position.x);
      const dy = Math.abs(y - box.position.y);
      const dz = Math.abs(z - box.position.z);

      const minDistanceX = (width + box.width) / 2;
      const minDistanceY = (height + box.height) / 2;
      const minDistanceZ = (length + box.length) / 2;

      if (dx < minDistanceX && dy < minDistanceY && dz < minDistanceZ) {
        return false; // Overlap detected
      }
    }

    return true;
  };

  const validateBoxPositions = () => {
    const container = CONTAINERS[containerType];
    setBoxes(prev => prev.map(box => {
      const isValid = isPositionValid(
        box.position.x, box.position.y, box.position.z,
        box.width, box.length, box.height, box.id
      );
      
      if (!isValid) {
        const newPosition = findOptimalPosition(
          box.width, box.length, box.height, 
          container.dimensions, box.isFragile
        );
        if (newPosition) {
          return { ...box, position: newPosition };
        }
      }
      return box;
    }));
  };

  useEffect(() => {
    validateBoxPositions();
  }, [containerType]);

  const rearrangeToDriverSide = () => {
    const container = CONTAINERS[containerType];
    
    // Separate fragile and non-fragile boxes
    const nonFragileBoxes = boxes.filter(box => !box.isFragile);
    const fragileBoxes = boxes.filter(box => box.isFragile);
    
    // Sort non-fragile boxes by height (shortest first for better stacking base)
    const sortedNonFragile = nonFragileBoxes.sort((a, b) => a.height - b.height);
    // Sort fragile boxes by height (shortest first)
    const sortedFragile = fragileBoxes.sort((a, b) => a.height - b.height);

    const rearrangedBoxes: Box[] = [];
    
    // Start from driver side (right side)
    let currentX = container.dimensions.width / 2 - 0.1;
    let currentZ = -container.dimensions.length / 2 + 0.1;
    
    // First, place all non-fragile boxes from driver side
    for (const box of sortedNonFragile) {
      let newX = currentX - box.width / 2;
      let newY = box.height / 2; // Start on floor
      let newZ = currentZ + box.length / 2;
      
      // Check if box fits in current position
      if (newZ + box.length / 2 > container.dimensions.length / 2) {
        // Move to next row (towards opposite side)
        currentX -= 0.6; // Move towards opposite side
        if (currentX - box.width / 2 < -container.dimensions.width / 2) {
          // If we've reached the opposite side, start a new layer
          currentX = container.dimensions.width / 2 - 0.1;
          currentZ = -container.dimensions.length / 2 + 0.1;
          // This would require 3D stacking logic for multiple layers
        } else {
          currentZ = -container.dimensions.length / 2 + 0.1;
        }
        newX = currentX - box.width / 2;
        newZ = currentZ + box.length / 2;
      }
      
      const rearrangedBox = {
        ...box,
        position: { x: newX, y: newY, z: newZ },
        isLocked: true,
      };
      
      rearrangedBoxes.push(rearrangedBox);
      currentZ += box.length;
    }
    
    // Second, place fragile boxes - prioritize stacking on non-fragile boxes
    for (const fragileBox of sortedFragile) {
      let bestPosition = null;
      let bestStackHeight = -1;
      
      // First priority: try to stack on top of non-fragile boxes
      for (const nonFragileBox of rearrangedBoxes.filter(b => !b.isFragile)) {
        const stackX = nonFragileBox.position.x;
        const stackY = nonFragileBox.position.y + nonFragileBox.height / 2 + fragileBox.height / 2;
        const stackZ = nonFragileBox.position.z;
        
        // Check if fragile box fits on top and doesn't exceed container height
        if (stackY + fragileBox.height / 2 <= container.dimensions.height &&
            fragileBox.width <= nonFragileBox.width &&
            fragileBox.length <= nonFragileBox.length) {
          
          // Check if this position is not occupied by another box
          const isOccupied = rearrangedBoxes.some(existingBox => {
            const dx = Math.abs(stackX - existingBox.position.x);
            const dy = Math.abs(stackY - existingBox.position.y);
            const dz = Math.abs(stackZ - existingBox.position.z);
            const minDistanceX = (fragileBox.width + existingBox.width) / 2;
            const minDistanceY = (fragileBox.height + existingBox.height) / 2;
            const minDistanceZ = (fragileBox.length + existingBox.length) / 2;
            return dx < minDistanceX && dy < minDistanceY && dz < minDistanceZ;
          });
          
          if (!isOccupied && stackY > bestStackHeight) {
            bestPosition = { x: stackX, y: stackY, z: stackZ };
            bestStackHeight = stackY;
          }
        }
      }
      
      // If no stacking position found, place on floor towards opposite side
      if (!bestPosition) {
        let newX = -container.dimensions.width / 2 + 0.1 + fragileBox.width / 2; // Opposite side
        let newY = fragileBox.height / 2;
        let newZ = currentZ + fragileBox.length / 2;
        
        if (newZ + fragileBox.length / 2 > container.dimensions.length / 2) {
          currentZ = -container.dimensions.length / 2 + 0.1;
          newZ = currentZ + fragileBox.length / 2;
        }
        
        bestPosition = { x: newX, y: newY, z: newZ };
        currentZ += fragileBox.length;
      }
      
      const rearrangedFragileBox = {
        ...fragileBox,
        position: bestPosition,
        isLocked: true,
      };
      
      rearrangedBoxes.push(rearrangedFragileBox);
    }

    setBoxes(rearrangedBoxes);
    Alert.alert('Success', 'Boxes arranged: Non-fragile at driver side, fragile stacked on top or at opposite side');
  };

  const addBox = () => {
    const w = parseFloat(width);
    const l = parseFloat(length);
    const h = parseFloat(height);

    if (!w || !l || !h || w <= 0 || l <= 0 || h <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive dimensions');
      return;
    }

    const container = CONTAINERS[containerType];
    
    if (w > container.dimensions.width || 
        l > container.dimensions.length || 
        h > container.dimensions.height) {
      Alert.alert(
        'Box Too Large', 
        `Box dimensions exceed container limits:\n${container.dimensions.width}m × ${container.dimensions.length}m × ${container.dimensions.height}m`
      );
      return;
    }

    const position = findOptimalPosition(w, l, h, container.dimensions, isFragile);
    
    if (!position) {
      Alert.alert(
        'No Space Available', 
        'Cannot fit this box in the remaining container space. Try smaller dimensions or remove some boxes.'
      );
      return;
    }

    const newBox: Box = {
      id: generateUUID(),
      width: w,
      length: l,
      height: h,
      position,
      color: COLORS[boxes.length % COLORS.length],
      isLocked: true,
      isSelected: false,
      isEditing: false,
      isFragile,
    };

    setBoxes([...boxes, newBox]);
    setWidth('');
    setLength('');
    setHeight('');
    setIsFragile(false);
  };

  const removeBox = (id: string) => {
    setBoxes(boxes.filter(box => box.id !== id));
    if (selectedBoxId === id) {
      setSelectedBoxId(null);
    }
  };

  const toggleBoxLock = (id: string) => {
    setBoxes(prev => prev.map(box => 
      box.id === id ? { ...box, isLocked: !box.isLocked } : box
    ));
  };

  const startEditingBox = (id: string) => {
    setBoxes(prev => prev.map(box => ({
      ...box,
      isSelected: box.id === id,
      isEditing: box.id === id,
      isLocked: box.id === id ? false : box.isLocked
    })));
    setSelectedBoxId(id);
    setEditMode(true);
  };

  const finishEditingBox = () => {
    if (selectedBoxId) {
      setBoxes(prev => prev.map(box => 
        box.id === selectedBoxId 
          ? { ...box, isLocked: true, isEditing: false, isSelected: false }
          : box
      ));
      setSelectedBoxId(null);
      setEditMode(false);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      return true;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return editMode || Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
    },
    onPanResponderGrant: (evt) => {
      if (editMode && selectedBoxId) {
        handleBoxPlacement(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      } else {
        setIsDragging(true);
        lastPanRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
      }
    },
    onPanResponderMove: (evt) => {
      if (editMode && selectedBoxId) {
        handleBoxPlacement(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      } else if (isDragging) {
        const deltaX = evt.nativeEvent.pageX - lastPanRef.current.x;
        const deltaY = evt.nativeEvent.pageY - lastPanRef.current.y;

        setCameraPosition(prev => {
          const sensitivity = 0.005;
          const newTheta = prev.theta - deltaX * sensitivity;
          const newPhi = Math.max(0.1, Math.min(Math.PI - 0.1, prev.phi + deltaY * sensitivity));
          
          return {
            ...prev,
            theta: newTheta,
            phi: newPhi,
          };
        });

        lastPanRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
      }
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });

  const handleBoxPlacement = (screenX: number, screenY: number) => {
    if (!selectedBoxId || !cameraRef.current || !raycasterRef.current || !editMode) return;

    if (!glViewLayout.width || !glViewLayout.height) return;

    const x = ((screenX - glViewLayout.x) / glViewLayout.width) * 2 - 1;
    const y = -((screenY - glViewLayout.y) / glViewLayout.height) * 2 + 1;

    raycasterRef.current.setFromCamera({ x, y }, cameraRef.current);

    // Create a plane at y=0 (floor level) for raycasting
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    raycasterRef.current.ray.intersectPlane(floorPlane, intersectionPoint);

    if (intersectionPoint) {
      const selectedBox = boxes.find(box => box.id === selectedBoxId);
      if (!selectedBox) return;

      // Snap to grid
      const gridSize = 0.1;
      const snappedX = Math.round(intersectionPoint.x / gridSize) * gridSize;
      const snappedZ = Math.round(intersectionPoint.z / gridSize) * gridSize;

      // Find the correct Y position (stacking)
      const topY = getTopSurfaceY(snappedX, snappedZ, selectedBoxId);
      let newY = topY + selectedBox.height / 2;

      // Check if fragile box is trying to stack on another fragile box
      if (topY > 0 && selectedBox.isFragile) {
        const boxBelow = boxes.find(box => {
          if (box.id === selectedBoxId) return false;
          const boxMinX = box.position.x - box.width / 2;
          const boxMaxX = box.position.x + box.width / 2;
          const boxMinZ = box.position.z - box.length / 2;
          const boxMaxZ = box.position.z + box.length / 2;
          const boxTopY = box.position.y + box.height / 2;
          return snappedX >= boxMinX && snappedX <= boxMaxX && 
                 snappedZ >= boxMinZ && snappedZ <= boxMaxZ && 
                 Math.abs(boxTopY - topY) < 0.01;
        });
        
        if (boxBelow && boxBelow.isFragile) {
          newY = selectedBox.height / 2; // Place on floor instead
        }
      }

      // Check if position is valid
      const isValid = isPositionValid(
        snappedX, newY, snappedZ,
        selectedBox.width, selectedBox.length, selectedBox.height,
        selectedBoxId
      );

      if (isValid) {
        setBoxes(prev => prev.map(box => 
          box.id === selectedBoxId 
            ? { ...box, position: { x: snappedX, y: newY, z: snappedZ } }
            : box
        ));
      }
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setCameraPosition(prev => ({
      ...prev,
      radius: Math.max(5, Math.min(25, prev.radius + (direction === 'in' ? -2 : 2))),
    }));
  };

  const resetCamera = () => {
    setCameraPosition({
      radius: 12,
      theta: Math.PI / 4,
      phi: Math.PI / 3,
    });
  };

  const updateCameraPosition = (camera: THREE.PerspectiveCamera) => {
    const { radius, theta, phi } = cameraPosition;
    
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    
    camera.lookAt(0, 1.3, 0);
  };

  useEffect(() => {
    if (cameraRef.current) {
      updateCameraPosition(cameraRef.current);
    }
  }, [cameraPosition]);

  const onContextCreate = async (gl: any) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: {
        width,
        height,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        clientHeight: height,
        getContext: () => gl,
      } as any,
      context: gl,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x222222);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    updateCameraPosition(camera);
    cameraRef.current = camera;

    // Create raycaster
    raycasterRef.current = new THREE.Raycaster();

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create container and grid
    createContainer(scene, containerType);
    createFloorGrid(scene, containerType);

    // Initial box rendering
    updateBoxesInScene(scene);

    // Render loop
    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  useEffect(() => {
    if (sceneRef.current) {
      updateBoxesInScene(sceneRef.current);
    }
  }, [boxes]);

  useEffect(() => {
    if (sceneRef.current) {
      createContainer(sceneRef.current, containerType);
      createFloorGrid(sceneRef.current, containerType);
    }
  }, [containerType]);

  const createContainer = (scene: THREE.Scene, type: '20ft' | '40ft') => {
    // Remove existing container
    const existingContainer = scene.getObjectByName('container');
    if (existingContainer) {
      scene.remove(existingContainer);
    }

    const container = CONTAINERS[type];
    const { width, height, length } = container.dimensions;

    const containerGroup = new THREE.Group();
    containerGroup.name = 'container';

    // Container walls (wireframe)
    const geometry = new THREE.BoxGeometry(width, height, length);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const wireframe = new THREE.LineSegments(edges, material);
    wireframe.position.y = height / 2;
    containerGroup.add(wireframe);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(width, length);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x333333, 
      transparent: true, 
      opacity: 0.3 
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    containerGroup.add(floor);

    scene.add(containerGroup);
  };

  const createFloorGrid = (scene: THREE.Scene, type: '20ft' | '40ft') => {
    const container = CONTAINERS[type];
    const { width, length } = container.dimensions;

    // Remove existing grid
    const existingGrid = scene.getObjectByName('grid');
    if (existingGrid) {
      scene.remove(existingGrid);
    }

    const size = Math.max(width, length) * 1.2;
    const divisions = 20;
    const gridColor = 0x444444;
    const gridHelper = new THREE.GridHelper(size, divisions, gridColor, gridColor);
    gridHelper.name = 'grid';
    scene.add(gridHelper);
  };

  const updateBoxesInScene = (scene: THREE.Scene) => {
    // Remove existing boxes
    const existingBoxes = scene.children.filter(child => child.name === 'box');
    existingBoxes.forEach(box => scene.remove(box));

    // Add current boxes
    boxes.forEach(box => {
      const geometry = new THREE.BoxGeometry(box.width, box.height, box.length);
      
      let color = box.color;
      if (box.isEditing) {
        color = '#FFFF00'; // Yellow for editing
      } else if (!isPositionValid(
        box.position.x, box.position.y, box.position.z,
        box.width, box.length, box.height, box.id
      )) {
        color = '#FF0000'; // Red for invalid position
      }
      
      const material = new THREE.MeshLambertMaterial({ 
        color: color,
        transparent: true,
        opacity: box.isLocked ? 0.8 : 0.6
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'box';
      mesh.position.set(box.position.x, box.position.y, box.position.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      
      // Add wireframe
      const edges = new THREE.EdgesGeometry(geometry);
      const edgeColor = box.isEditing ? 0xFFFF00 : (box.isLocked ? 0x000000 : 0x666666);
      const edgeMaterial = new THREE.LineBasicMaterial({ color: edgeColor });
      const wireframe = new THREE.LineSegments(edges, edgeMaterial);
      mesh.add(wireframe);
      
      // Add fragile indicator
      if (box.isFragile) {
        const textGeometry = new THREE.RingGeometry(0.05, 0.1, 8);
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const fragileIndicator = new THREE.Mesh(textGeometry, textMaterial);
        fragileIndicator.position.set(0, box.height / 2 + 0.05, 0);
        fragileIndicator.rotation.x = -Math.PI / 2;
        mesh.add(fragileIndicator);
      }
      
      scene.add(mesh);
    });
  };

  const calculateSpaceUtilization = () => {
    const container = CONTAINERS[containerType];
    const containerVolume = container.dimensions.width * container.dimensions.length * container.dimensions.height;
    const usedVolume = boxes.reduce((total, box) => total + (box.width * box.length * box.height), 0);
    return Math.round((usedVolume / containerVolume) * 100);
  };

  const handleBack = () => {
    router.back();
  };

  const renderBoxItem = ({ item }: { item: Box }) => (
    <View className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View 
              className="w-4 h-4 rounded mr-3"
              style={{ backgroundColor: item.color }}
            />
            <Text className="text-base font-semibold text-gray-900">
              {item.width.toFixed(1)}m × {item.length.toFixed(1)}m × {item.height.toFixed(1)}m
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mb-1">
            Position: ({item.position.x.toFixed(1)}, {item.position.y.toFixed(1)}, {item.position.z.toFixed(1)})
          </Text>
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500 mr-3">
              {item.isLocked ? '🔒 Locked' : '📦 Unlocked'}
            </Text>
            <Text className="text-xs text-gray-500">
              {item.isFragile ? '⚠️ Fragile' : '💪 Durable'}
            </Text>
            {item.isEditing && (
              <Text className="text-xs text-yellow-600 ml-3">✏️ Editing</Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center space-x-2">
          {!item.isLocked && !editMode && (
            <TouchableOpacity
              className="bg-blue-100 p-2 rounded"
              onPress={() => startEditingBox(item.id)}
            >
              <MaterialIcons name="edit" size={16} color="#3B82F6" />
            </TouchableOpacity>
          )}
          {!editMode && (
            <TouchableOpacity
              className="bg-gray-100 p-2 rounded"
              onPress={() => toggleBoxLock(item.id)}
            >
              <MaterialIcons 
                name={item.isLocked ? "lock-open" : "lock"} 
                size={16} 
                color="#6B7280" 
              />
            </TouchableOpacity>
          )}
          {!editMode && (
            <TouchableOpacity
              className="bg-red-100 p-2 rounded"
              onPress={() => removeBox(item.id)}
            >
              <MaterialIcons name="delete" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity 
          onPress={handleBack}
          className="mr-4 p-2 -ml-2 active:opacity-80"
        >
          <MaterialIcons name="arrow-back" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900">
            3D Container Packer {editMode ? '(Edit Mode)' : ''}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            Visualize and arrange your cargo efficiently
          </Text>
        </View>
        {editMode && (
          <TouchableOpacity 
            className="bg-green-500 px-4 py-2 rounded-lg"
            onPress={finishEditingBox}
          >
            <Text className="text-white font-semibold">Done</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Container Selection */}
        {!editMode && (
          <View className="px-6 py-4 bg-white border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Container Type</Text>
            <View className="flex-row space-x-3">
              {Object.entries(CONTAINERS).map(([key, container]) => (
                <TouchableOpacity
                  key={key}
                  className={`flex-1 p-4 rounded-lg border-2 ${
                    containerType === key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                  onPress={() => setContainerType(key as '20ft' | '40ft')}
                >
                  <Text className={`text-center font-semibold ${
                    containerType === key ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {container.name}
                  </Text>
                  <Text className="text-center text-sm text-gray-500 mt-1">
                    {container.dimensions.width}m × {container.dimensions.length}m × {container.dimensions.height}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Add Box Form */}
        {!editMode && (
          <View className="px-6 py-4 bg-white border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Add New Box</Text>
            <View className="flex-row space-x-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Width (m)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={width}
                  onChangeText={setWidth}
                  placeholder="0.0"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Length (m)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={length}
                  onChangeText={setLength}
                  placeholder="0.0"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">Height (m)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="0.0"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
            
            <TouchableOpacity 
              className={`p-3 rounded-lg border-2 mb-4 ${
                isFragile 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-300 bg-white'
              }`}
              onPress={() => setIsFragile(!isFragile)}
            >
              <Text className={`text-center font-medium ${
                isFragile ? 'text-red-700' : 'text-gray-700'
              }`}>
                ⚠️ Fragile Box
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-blue-500 p-4 rounded-lg flex-row items-center justify-center"
              onPress={addBox}
            >
              <MaterialIcons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Add Box</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3D Scene */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">3D Container View</Text>
            {!editMode && (
              <TouchableOpacity 
                className="bg-green-500 px-4 py-2 rounded-lg flex-row items-center"
                onPress={rearrangeToDriverSide}
              >
                <MaterialIcons name="auto-fix-high" size={16} color="white" />
                <Text className="text-white font-medium ml-2">Auto Arrange</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Camera Controls */}
          {!editMode && (
            <View className="flex-row justify-between mb-4 space-x-2">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 p-3 rounded-lg"
                onPress={() => handleZoom('in')}
              >
                <Text className="text-center text-gray-700 font-medium">Zoom In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-gray-200 p-3 rounded-lg"
                onPress={() => handleZoom('out')}
              >
                <Text className="text-center text-gray-700 font-medium">Zoom Out</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-gray-200 p-3 rounded-lg"
                onPress={resetCamera}
              >
                <Text className="text-center text-gray-700 font-medium">Reset View</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View className="h-80 rounded-lg overflow-hidden bg-black">
            <GLView
              style={{ flex: 1 }}
              ref={glViewRef}
              onContextCreate={onContextCreate}
              onLayout={(event) => {
                if (Platform.OS === 'web') {
                  const { target } = event.nativeEvent;
                  if (target && target.getBoundingClientRect) {
                    const rect = target.getBoundingClientRect();
                    setGlViewLayout({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
                  }
                } else {
                  if (glViewRef.current && glViewRef.current.measureInWindow) {
                    glViewRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
                      setGlViewLayout({ x, y, width, height });
                    });
                  }
                }
              }}
              {...panResponder.panHandlers}
            />
          </View>
          
          <Text className="text-center text-sm text-gray-600 mt-2">
            {editMode 
              ? "Drag to move the selected box • Boxes will stack automatically"
              : "Drag to rotate • Use buttons to zoom • Tap Edit to move boxes"
            }
          </Text>

          {/* Space Utilization */}
          <View className="bg-blue-50 p-4 rounded-lg mt-4">
            <Text className="text-center text-lg font-semibold text-blue-900">
              Space Utilization: {calculateSpaceUtilization()}%
            </Text>
            <Text className="text-center text-sm text-blue-700 mt-1">
              {boxes.length} boxes • {boxes.filter(b => b.isFragile).length} fragile
            </Text>
          </View>
        </View>

        {/* Box List */}
        {!editMode && (
          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Boxes ({boxes.length})
            </Text>
            {boxes.length === 0 ? (
              <Text className="text-center text-gray-500 italic py-8">
                No boxes added yet. Add your first box above!
              </Text>
            ) : (
              <FlatList
                data={boxes}
                renderItem={renderBoxItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}