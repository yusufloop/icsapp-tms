import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { GLView } from 'expo-gl';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import * as THREE from 'three';

// Constants for efficiency
const CONTAINERS = {
  '20ft': { width: 2.35, length: 5.9, height: 2.39 },
  '40ft': { width: 2.35, length: 12.03, height: 2.39 },
} as const;

const BOX_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

interface Box {
  id: string;
  width: number;
  length: number;
  height: number;
  position: { x: number; y: number; z: number };
  color: string;
  isFragile: boolean;
}

interface ContainerViewerProps {
  onClose?: () => void;
}

export function ContainerViewer({ onClose }: ContainerViewerProps) {
  // Core Three.js refs
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationFrameRef = useRef<number>();
  
  // State
  const [containerType, setContainerType] = useState<'20ft' | '40ft'>('20ft');
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [dimensions, setDimensions] = useState({ width: '', length: '', height: '' });
  const [isFragile, setIsFragile] = useState(false);
  const [cameraState, setCameraState] = useState({
    radius: 8,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });

  // Memoized container dimensions
  const containerDims = useMemo(() => CONTAINERS[containerType], [containerType]);

  // Generate unique ID
  const generateId = useCallback(() => 
    Date.now().toString(36) + Math.random().toString(36).substr(2), []
  );

  // Box collision detection
  const isValidPosition = useCallback((
    x: number, y: number, z: number,
    width: number, length: number, height: number,
    excludeId?: string
  ): boolean => {
    // Container bounds check
    const halfW = width / 2, halfL = length / 2, halfH = height / 2;
    const containerHalfW = containerDims.width / 2;
    const containerHalfL = containerDims.length / 2;
    
    if (x - halfW < -containerHalfW || x + halfW > containerHalfW ||
        z - halfL < -containerHalfL || z + halfL > containerHalfL ||
        y - halfH < 0 || y + halfH > containerDims.height) {
      return false;
    }

    // Box overlap check
    return !boxes.some(box => {
      if (box.id === excludeId) return false;
      
      const dx = Math.abs(x - box.position.x);
      const dy = Math.abs(y - box.position.y);
      const dz = Math.abs(z - box.position.z);
      
      return dx < (width + box.width) / 2 &&
             dy < (height + box.height) / 2 &&
             dz < (length + box.length) / 2;
    });
  }, [boxes, containerDims]);

  // Find optimal position for new box
  const findOptimalPosition = useCallback((
    width: number, length: number, height: number
  ): { x: number; y: number; z: number } | null => {
    const step = 0.2; // 20cm grid
    const halfW = containerDims.width / 2;
    const halfL = containerDims.length / 2;
    
    // Try floor first, then stack
    for (let y = height / 2; y <= containerDims.height - height / 2; y += step) {
      for (let z = -halfL + length / 2; z <= halfL - length / 2; z += step) {
        for (let x = -halfW + width / 2; x <= halfW - width / 2; x += step) {
          if (isValidPosition(x, y, z, width, length, height)) {
            return { x, y, z };
          }
        }
      }
    }
    return null;
  }, [containerDims, isValidPosition]);

  // Update camera position
  const updateCamera = useCallback(() => {
    if (!cameraRef.current) return;
    
    const { radius, theta, phi } = cameraState;
    const camera = cameraRef.current;
    
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(0, containerDims.height / 2, 0);
  }, [cameraState, containerDims]);

  // Create container wireframe
  const createContainer = useCallback((scene: THREE.Scene) => {
    // Remove existing container
    const existing = scene.getObjectByName('container');
    if (existing) scene.remove(existing);

    const group = new THREE.Group();
    group.name = 'container';

    // Container wireframe
    const geometry = new THREE.BoxGeometry(
      containerDims.width,
      containerDims.height,
      containerDims.length
    );
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const wireframe = new THREE.LineSegments(edges, material);
    wireframe.position.y = containerDims.height / 2;
    group.add(wireframe);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(
      containerDims.width,
      containerDims.length
    );
    const floorMaterial = new THREE.MeshBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.3,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);

    scene.add(group);
  }, [containerDims]);

  // Update boxes in scene
  const updateBoxes = useCallback((scene: THREE.Scene) => {
    // Remove existing boxes
    const existingBoxes = scene.children.filter(child => child.name === 'box');
    existingBoxes.forEach(box => scene.remove(box));

    // Add current boxes
    boxes.forEach(box => {
      const geometry = new THREE.BoxGeometry(box.width, box.height, box.length);
      const material = new THREE.MeshBasicMaterial({
        color: box.color,
        transparent: true,
        opacity: 0.8,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = 'box';
      mesh.position.set(box.position.x, box.position.y, box.position.z);

      // Add wireframe
      const edges = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const wireframe = new THREE.LineSegments(edges, edgeMaterial);
      mesh.add(wireframe);

      // Fragile indicator
      if (box.isFragile) {
        const indicatorGeometry = new THREE.RingGeometry(0.05, 0.1, 8);
        const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
        indicator.position.set(0, box.height / 2 + 0.05, 0);
        indicator.rotation.x = -Math.PI / 2;
        mesh.add(indicator);
      }

      scene.add(mesh);
    });
  }, [boxes]);

  // Three.js scene initialization
  const onContextCreate = useCallback(async (gl: any) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // Create renderer without expo-gl-cpp
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
      antialias: false, // Disable for performance
      powerPreference: 'high-performance',
    });
    
    renderer.setSize(width, height);
    renderer.setClearColor(0x222222);
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Create initial container
    createContainer(scene);
    updateCamera();

    // Render loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [createContainer, updateCamera]);

  // Update scene when dependencies change
  useEffect(() => {
    if (sceneRef.current) {
      createContainer(sceneRef.current);
    }
  }, [containerType, createContainer]);

  useEffect(() => {
    if (sceneRef.current) {
      updateBoxes(sceneRef.current);
    }
  }, [boxes, updateBoxes]);

  useEffect(() => {
    updateCamera();
  }, [updateCamera]);

  // Gesture handlers
  const panGesture = useMemo(() => 
    Gesture.Pan()
      .onUpdate((event) => {
        const sensitivity = 0.01;
        setCameraState(prev => ({
          ...prev,
          theta: prev.theta - event.translationX * sensitivity,
          phi: Math.max(0.1, Math.min(Math.PI - 0.1, prev.phi + event.translationY * sensitivity)),
        }));
      }),
    []
  );

  const pinchGesture = useMemo(() =>
    Gesture.Pinch()
      .onUpdate((event) => {
        setCameraState(prev => ({
          ...prev,
          radius: Math.max(3, Math.min(20, prev.radius / event.scale)),
        }));
      }),
    []
  );

  const composedGesture = useMemo(() => 
    Gesture.Simultaneous(panGesture, pinchGesture),
    [panGesture, pinchGesture]
  );

  // Box management
  const addBox = useCallback(() => {
    const w = parseFloat(dimensions.width);
    const l = parseFloat(dimensions.length);
    const h = parseFloat(dimensions.height);

    if (!w || !l || !h || w <= 0 || l <= 0 || h <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid positive dimensions');
      return;
    }

    if (w > containerDims.width || l > containerDims.length || h > containerDims.height) {
      Alert.alert('Box Too Large', 'Box exceeds container dimensions');
      return;
    }

    const position = findOptimalPosition(w, l, h);
    if (!position) {
      Alert.alert('No Space', 'Cannot fit box in remaining space');
      return;
    }

    const newBox: Box = {
      id: generateId(),
      width: w,
      length: l,
      height: h,
      position,
      color: BOX_COLORS[boxes.length % BOX_COLORS.length],
      isFragile,
    };

    setBoxes(prev => [...prev, newBox]);
    setDimensions({ width: '', length: '', height: '' });
    setIsFragile(false);
  }, [dimensions, isFragile, containerDims, findOptimalPosition, generateId, boxes.length]);

  const removeBox = useCallback((id: string) => {
    setBoxes(prev => prev.filter(box => box.id !== id));
  }, []);

  const autoArrange = useCallback(() => {
    if (boxes.length === 0) return;

    const arranged: Box[] = [];
    const sortedBoxes = [...boxes].sort((a, b) => {
      // Sort by fragile status first, then by volume
      if (a.isFragile !== b.isFragile) return a.isFragile ? 1 : -1;
      return (b.width * b.length * b.height) - (a.width * a.length * a.height);
    });

    let currentX = -containerDims.width / 2;
    let currentZ = -containerDims.length / 2;
    let currentY = 0;

    for (const box of sortedBoxes) {
      let newX = currentX + box.width / 2;
      let newZ = currentZ + box.length / 2;
      let newY = currentY + box.height / 2;

      // Check if box fits in current row
      if (newX + box.width / 2 > containerDims.width / 2) {
        // Move to next row
        currentX = -containerDims.width / 2;
        currentZ += 0.6; // Move forward
        newX = currentX + box.width / 2;
        newZ = currentZ + box.length / 2;
      }

      // Check if we need to go to next level
      if (newZ + box.length / 2 > containerDims.length / 2) {
        currentX = -containerDims.width / 2;
        currentZ = -containerDims.length / 2;
        currentY += 1; // Move up
        newX = currentX + box.width / 2;
        newZ = currentZ + box.length / 2;
        newY = currentY + box.height / 2;
      }

      // Validate position
      if (isValidPosition(newX, newY, newZ, box.width, box.length, box.height)) {
        arranged.push({
          ...box,
          position: { x: newX, y: newY, z: newZ },
        });
        currentX += box.width;
      }
    }

    setBoxes(arranged);
    Alert.alert('Success', 'Boxes arranged optimally');
  }, [boxes, containerDims, isValidPosition]);

  // Calculate space utilization
  const spaceUtilization = useMemo(() => {
    const containerVolume = containerDims.width * containerDims.length * containerDims.height;
    const usedVolume = boxes.reduce((total, box) => 
      total + (box.width * box.length * box.height), 0
    );
    return Math.round((usedVolume / containerVolume) * 100);
  }, [boxes, containerDims]);

  // Camera controls
  const zoomIn = useCallback(() => {
    setCameraState(prev => ({ ...prev, radius: Math.max(3, prev.radius - 1) }));
  }, []);

  const zoomOut = useCallback(() => {
    setCameraState(prev => ({ ...prev, radius: Math.min(20, prev.radius + 1) }));
  }, []);

  const resetCamera = useCallback(() => {
    setCameraState({ radius: 8, theta: Math.PI / 4, phi: Math.PI / 3 });
  }, []);

  // Web-specific wheel handler
  const handleWheel = useCallback((event: any) => {
    if (Platform.OS !== 'web') return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? 1 : -1;
    setCameraState(prev => ({
      ...prev,
      radius: Math.max(3, Math.min(20, prev.radius + delta * 0.5)),
    }));
  }, []);

  return (
    <View className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="bg-gray-800 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialIcons name="view-in-ar" size={24} color="#60A5FA" />
          <Text className="text-white text-lg font-semibold ml-2">
            Container Packer 3D
          </Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} className="p-2">
            <MaterialIcons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 flex-row">
        {/* Controls Panel */}
        <View className="w-80 bg-gray-800 border-r border-gray-700">
          <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
            {/* Container Selection */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">Container Type</Text>
              <View className="flex-row space-x-2">
                {Object.entries(CONTAINERS).map(([key, dims]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setContainerType(key as '20ft' | '40ft')}
                    className={`flex-1 p-3 rounded-lg border ${
                      containerType === key
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700'
                    }`}
                  >
                    <Text className={`text-center font-medium ${
                      containerType === key ? 'text-blue-300' : 'text-gray-300'
                    }`}>
                      {key}
                    </Text>
                    <Text className="text-center text-xs text-gray-400 mt-1">
                      {dims.width}×{dims.length}×{dims.height}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Add Box Form */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">Add Box</Text>
              
              <View className="space-y-3">
                <View className="flex-row space-x-2">
                  <View className="flex-1">
                    <Text className="text-gray-300 text-sm mb-1">Width (m)</Text>
                    <TextInput
                      value={dimensions.width}
                      onChangeText={(text) => setDimensions(prev => ({ ...prev, width: text }))}
                      placeholder="0.0"
                      placeholderTextColor="#6B7280"
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-300 text-sm mb-1">Length (m)</Text>
                    <TextInput
                      value={dimensions.length}
                      onChangeText={(text) => setDimensions(prev => ({ ...prev, length: text }))}
                      placeholder="0.0"
                      placeholderTextColor="#6B7280"
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-300 text-sm mb-1">Height (m)</Text>
                    <TextInput
                      value={dimensions.height}
                      onChangeText={(text) => setDimensions(prev => ({ ...prev, height: text }))}
                      placeholder="0.0"
                      placeholderTextColor="#6B7280"
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setIsFragile(!isFragile)}
                  className={`p-3 rounded-lg border ${
                    isFragile
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-gray-600 bg-gray-700'
                  }`}
                >
                  <Text className={`text-center font-medium ${
                    isFragile ? 'text-red-300' : 'text-gray-300'
                  }`}>
                    ⚠️ Fragile Box
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={addBox}
                  className="bg-blue-600 p-3 rounded-lg flex-row items-center justify-center"
                >
                  <MaterialIcons name="add" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Add Box</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Camera Controls */}
            <View className="mb-6">
              <Text className="text-white font-semibold mb-3">Camera</Text>
              <View className="space-y-2">
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={zoomIn}
                    className="flex-1 bg-gray-700 p-2 rounded"
                  >
                    <Text className="text-gray-300 text-center text-sm">Zoom In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={zoomOut}
                    className="flex-1 bg-gray-700 p-2 rounded"
                  >
                    <Text className="text-gray-300 text-center text-sm">Zoom Out</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={resetCamera}
                  className="bg-gray-700 p-2 rounded"
                >
                  <Text className="text-gray-300 text-center text-sm">Reset View</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Box List */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white font-semibold">
                  Boxes ({boxes.length})
                </Text>
                {boxes.length > 0 && (
                  <TouchableOpacity
                    onPress={autoArrange}
                    className="bg-green-600 px-3 py-1 rounded"
                  >
                    <Text className="text-white text-sm">Auto Arrange</Text>
                  </TouchableOpacity>
                )}
              </View>

              {boxes.length === 0 ? (
                <Text className="text-gray-400 text-center italic py-4">
                  No boxes added yet
                </Text>
              ) : (
                <View className="space-y-2 max-h-60">
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {boxes.map((box) => (
                      <View
                        key={box.id}
                        className="bg-gray-700 rounded p-3 flex-row items-center justify-between"
                      >
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <View
                              className="w-3 h-3 rounded mr-2"
                              style={{ backgroundColor: box.color }}
                            />
                            <Text className="text-white text-sm font-medium">
                              {box.width.toFixed(1)}×{box.length.toFixed(1)}×{box.height.toFixed(1)}m
                            </Text>
                          </View>
                          <Text className="text-gray-400 text-xs">
                            {box.isFragile ? '⚠️ Fragile' : '📦 Standard'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeBox(box.id)}
                          className="p-1"
                        >
                          <MaterialIcons name="delete" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Space Utilization */}
            <View className="bg-blue-900/30 rounded-lg p-4">
              <Text className="text-blue-300 font-semibold text-center">
                Space Utilization
              </Text>
              <Text className="text-white text-2xl font-bold text-center mt-1">
                {spaceUtilization}%
              </Text>
              <Text className="text-blue-300 text-sm text-center mt-1">
                {boxes.length} boxes • {boxes.filter(b => b.isFragile).length} fragile
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* 3D Viewer */}
        <View className="flex-1 relative">
          <GestureDetector gesture={composedGesture}>
            <GLView
              style={{ flex: 1 }}
              onContextCreate={onContextCreate}
              {...(Platform.OS === 'web' && { onWheel: handleWheel })}
            />
          </GestureDetector>

          {/* Instructions Overlay */}
          <View className="absolute bottom-4 left-4 right-4">
            <View className="bg-black/60 rounded-lg p-3">
              <Text className="text-white text-sm text-center">
                {Platform.OS === 'web' 
                  ? 'Drag to rotate • Scroll to zoom • Click controls to add boxes'
                  : 'Drag to rotate • Pinch to zoom • Use controls to add boxes'
                }
              </Text>
            </View>
          </View>

          {/* Mobile Camera Controls Overlay */}
          {Platform.OS !== 'web' && (
            <View className="absolute top-4 right-4 space-y-2">
              <TouchableOpacity
                onPress={zoomIn}
                className="bg-black/60 p-3 rounded-full"
              >
                <MaterialIcons name="zoom-in" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={zoomOut}
                className="bg-black/60 p-3 rounded-full"
              >
                <MaterialIcons name="zoom-out" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetCamera}
                className="bg-black/60 p-3 rounded-full"
              >
                <MaterialIcons name="refresh" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}