import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  PanResponder,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Package, Plus, Trash2, Move, Lock, Clock as Unlock, Sun, Moon, ArrowRight } from 'lucide-react-native';

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

interface PlacedBox {
  x: number;
  y: number;
  z: number;
  width: number;
  length: number;
  height: number;
}

interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryText: string;
  error: string;
  success: string;
}

const lightTheme: ThemeColors = {
  background: '#ffffff',
  surface: '#f8f9fa',
  surfaceSecondary: '#e9ecef',
  text: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  primary: '#0d6efd',
  primaryText: '#ffffff',
  error: '#dc3545',
  success: '#198754',
};

const darkTheme: ThemeColors = {
  background: '#111827',
  surface: '#1f2937',
  surfaceSecondary: '#374151',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  border: '#374151',
  primary: '#3b82f6',
  primaryText: '#ffffff',
  error: '#ef4444',
  success: '#10b981',
};

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
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? darkTheme : lightTheme;
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

  const toggleTheme = () => setIsDark(!isDark);

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
      // Always allow pan responder to start
      return true;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Allow movement if we're in edit mode or if movement is significant enough for camera rotation
      return editMode || Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
    },
    onPanResponderGrant: (evt) => {
      if (editMode && selectedBoxId) {
        // In edit mode, start box placement immediately
        handleBoxPlacement(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      } else {
        // Set up camera dragging
        setIsDragging(true);
        lastPanRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
        };
      }
    },
    onPanResponderMove: (evt) => {
      if (editMode && selectedBoxId) {
        // Handle box placement in edit mode
        handleBoxPlacement(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      } else if (isDragging) {
        // Handle camera rotation only when not in edit mode
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
      // Reset dragging state when gesture ends
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
        // Find the box at this position to check if it's fragile
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
        
        // If the box below is fragile, don't allow stacking
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
    renderer.setClearColor(isDark ? 0x222222 : 0xf0f0f0);
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

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setClearColor(isDark ? 0x222222 : 0xf0f0f0);
    }
  }, [isDark]);

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
    const material = new THREE.LineBasicMaterial({ color: isDark ? 0x00ff00 : 0x007700 });
    const wireframe = new THREE.LineSegments(edges, material);
    wireframe.position.y = height / 2;
    containerGroup.add(wireframe);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(width, length);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: isDark ? 0x333333 : 0xcccccc, 
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
    const gridColor = isDark ? 0x444444 : 0x888888;
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

  const styles = createStyles(theme);

  const renderBoxItem = ({ item }: { item: Box }) => (
    <View style={styles.boxItem}>
      <View style={styles.boxInfo}>
        <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
        <View style={styles.boxDetails}>
          <Text style={styles.boxDimensions}>
            {item.width.toFixed(1)}m × {item.length.toFixed(1)}m × {item.height.toFixed(1)}m
          </Text>
          <Text style={styles.boxPosition}>
            Position: ({item.position.x.toFixed(1)}, {item.position.y.toFixed(1)}, {item.position.z.toFixed(1)})
          </Text>
          <Text style={styles.boxStatus}>
            {item.isLocked ? '🔒 Locked' : '📦 Unlocked'} {item.isFragile ? '⚠️ Fragile' : '💪 Durable'} {item.isEditing ? '✏️ Editing' : ''}
          </Text>
        </View>
      </View>
      <View style={styles.boxActions}>
        {!item.isLocked && !editMode && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => startEditingBox(item.id)}
          >
            <Move size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
        {!editMode && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleBoxLock(item.id)}
          >
            {item.isLocked ? (
              <Unlock size={16} color={theme.textSecondary} />
            ) : (
              <Lock size={16} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        )}
        {!editMode && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => removeBox(item.id)}
          >
            <Trash2 size={16} color={theme.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Package size={24} color={theme.text} />
          <Text style={styles.title}>Container Packer 3D {editMode ? '(Edit Mode)' : ''}</Text>
          <View style={styles.headerActions}>
            {editMode && (
              <TouchableOpacity style={styles.doneButton} onPress={finishEditingBox}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
              {isDark ? <Sun size={24} color={theme.text} /> : <Moon size={24} color={theme.text} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Container Selection */}
        {!editMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Container Type</Text>
            <View style={styles.containerSelector}>
              {Object.entries(CONTAINERS).map(([key, container]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.containerOption,
                    containerType === key && styles.containerOptionActive
                  ]}
                  onPress={() => setContainerType(key as '20ft' | '40ft')}
                >
                  <Text style={[
                    styles.containerOptionText,
                    containerType === key && styles.containerOptionTextActive
                  ]}>
                    {container.name}
                  </Text>
                  <Text style={styles.containerDimensions}>
                    {container.dimensions.width}m × {container.dimensions.length}m × {container.dimensions.height}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Add Box Form */}
        {!editMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add New Box</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Width (m)</Text>
                <TextInput
                  style={styles.input}
                  value={width}
                  onChangeText={setWidth}
                  placeholder="0.0"
                  keyboardType="numeric"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Length (m)</Text>
                <TextInput
                  style={styles.input}
                  value={length}
                  onChangeText={setLength}
                  placeholder="0.0"
                  keyboardType="numeric"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (m)</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="0.0"
                  keyboardType="numeric"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.fragileToggle, isFragile && styles.fragileToggleActive]} 
              onPress={() => setIsFragile(!isFragile)}
            >
              <Text style={[styles.fragileToggleText, isFragile && styles.fragileToggleTextActive]}>
                ⚠️ Fragile Box
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addButton} onPress={addBox}>
              <Plus size={20} color={theme.primaryText} />
              <Text style={styles.addButtonText}>Add Box</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 3D Scene */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>3D Container View</Text>
            {!editMode && (
              <TouchableOpacity style={styles.rearrangeButton} onPress={rearrangeToDriverSide}>
                <ArrowRight size={16} color={theme.primaryText} />
                <Text style={styles.rearrangeButtonText}>Arrange to Driver Side</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Camera Controls */}
          {!editMode && (
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={() => handleZoom('in')}
              >
                <Text style={styles.controlButtonText}>Zoom In</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={() => handleZoom('out')}
              >
                <Text style={styles.controlButtonText}>Zoom Out</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={resetCamera}
              >
                <Text style={styles.controlButtonText}>Reset View</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.sceneContainer}>
            <GLView
              style={styles.glView}
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
          
          <Text style={styles.instructionText}>
            {editMode 
              ? "Drag to move the selected box • Boxes will stack automatically"
              : "Drag to rotate • Use buttons to zoom • Tap Move to edit boxes"
            }
          </Text>
        </View>

        {/* Box List */}
        {!editMode && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Boxes ({boxes.length})</Text>
            {boxes.length === 0 ? (
              <Text style={styles.emptyText}>No boxes added yet</Text>
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
    </View>
  );
}

const createStyles = (theme: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollView: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 20, 
    paddingTop: 60, 
    backgroundColor: theme.surface 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.text, flex: 1, marginLeft: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doneButton: { backgroundColor: theme.success, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 16 },
  doneButtonText: { color: theme.primaryText, fontWeight: '600' },
  themeButton: { padding: 8 },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: theme.border },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  containerSelector: { flexDirection: 'row', gap: 12 },
  containerOption: { 
    flex: 1, 
    padding: 16, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: theme.border, 
    backgroundColor: theme.surface 
  },
  containerOptionActive: { borderColor: theme.primary, backgroundColor: theme.primary },
  containerOptionText: { fontSize: 16, fontWeight: '600', color: theme.text, textAlign: 'center' },
  containerOptionTextActive: { color: theme.primaryText },
  containerDimensions: { fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginTop: 4 },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: theme.text, marginBottom: 8 },
  input: { 
    borderWidth: 1, 
    borderColor: theme.border, 
    borderRadius: 6, 
    padding: 12, 
    fontSize: 16, 
    color: theme.text, 
    backgroundColor: theme.surface 
  },
  fragileToggle: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    marginBottom: 16,
    alignItems: 'center',
  },
  fragileToggleActive: {
    borderColor: '#ff6b6b',
    backgroundColor: '#ff6b6b',
  },
  fragileToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
  },
  fragileToggleTextActive: {
    color: '#ffffff',
  },
  addButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: theme.primary, 
    borderRadius: 8, 
    padding: 16, 
    gap: 8 
  },
  addButtonText: { fontSize: 16, fontWeight: '600', color: theme.primaryText },
  rearrangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.success,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  rearrangeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.primaryText,
  },
  sceneContainer: { height: 300, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000000' },
  cameraControls: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12, gap: 8 },
  controlButton: { backgroundColor: theme.surfaceSecondary, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, flex: 1 },
  controlButtonText: { color: theme.text, fontSize: 12, fontWeight: '500', textAlign: 'center' },
  instructionText: { fontSize: 12, color: theme.textSecondary, textAlign: 'center', marginTop: 8 },
  glView: { flex: 1 },
  boxItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: theme.surface, 
    borderRadius: 8, 
    marginBottom: 8 
  },
  boxInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  colorIndicator: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  boxDetails: { flex: 1 },
  boxDimensions: { fontSize: 14, fontWeight: '600', color: theme.text },
  boxPosition: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  boxStatus: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  boxActions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8, borderRadius: 6, backgroundColor: theme.surfaceSecondary },
  deleteButton: { backgroundColor: theme.error + '20' },
  emptyText: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', fontStyle: 'italic' },
});