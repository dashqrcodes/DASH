#!/usr/bin/env python3
"""
OCR-Enabled JPEG Template Analyzer
Scans uploaded JPEG files and detects text, layout, positioning
"""

import sys
from PIL import Image
import cv2
import numpy as np

class JPEGAnalyzer:
    def __init__(self, image_path):
        self.image_path = image_path
        self.image = None
        self.gray = None
        self.width = None
        self.height = None
        
    def load_image(self):
        """Load and analyze basic image properties"""
        self.image = cv2.imread(self.image_path)
        self.gray = cv2.cvtColor(self.image, cv2.COLOR_BGR2GRAY)
        self.height, self.width = self.image.shape[:2]
        return True
    
    def detect_text_regions(self):
        """Detect regions that likely contain text"""
        edges = cv2.Canny(self.gray, 50, 150, apertureSize=3)
        kernel = np.ones((3, 30), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=1)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        text_regions = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if h > 10 and w > 50:
                text_regions.append({
                    'x': x,
                    'y': y,
                    'width': w,
                    'height': h,
                    'area': w * h
                })
        
        return sorted(text_regions, key=lambda r: (r['y'], r['x']))
    
    def detect_qr_code_area(self):
        """Detect potential QR code regions (square areas)"""
        corners = cv2.goodFeaturesToTrack(self.gray, maxCorners=100, qualityLevel=0.01, minDistance=10)
        
        if corners is not None:
            corners = np.int0(corners)
            qr_candidates = []
            for i, corner in enumerate(corners):
                x, y = corner.ravel()
                if 50 <= x <= self.width - 50 and 50 <= y <= self.height - 50:
                    region = self.gray[max(0, y-50):min(self.height, y+50),
                                       max(0, x-50):min(self.width, x+50)]
                    if region.size > 0:
                        std_dev = np.std(region)
                        if std_dev > 30:
                            qr_candidates.append({'x': x, 'y': y, 'size': 100})
            
            if qr_candidates:
                return qr_candidates[0]
        
        return None
    
    def analyze_layout(self):
        """Comprehensive layout analysis"""
        if not self.load_image():
            return None
        
        analysis = {
            'dimensions': {
                'width': self.width,
                'height': self.height,
                'aspect_ratio': round(self.width / self.height, 2)
            },
            'text_regions': self.detect_text_regions(),
            'qr_code': self.detect_qr_code_area(),
            'layout_type': 'front' if len(self.detect_text_regions()) > 5 else 'back'
        }
        
        return analysis
    
    def print_analysis(self):
        """Print formatted analysis"""
        analysis = self.analyze_layout()
        
        print("\n" + "="*50)
        print(f"📄 ANALYZING: {self.image_path}")
        print("="*50)
        print(f"\n📐 DIMENSIONS: {analysis['dimensions']['width']}x{analysis['dimensions']['height']}px")
        print(f"📝 TEXT REGIONS: {len(analysis['text_regions'])} areas detected")
        if analysis['qr_code']:
            print(f"🔲 QR CODE: Found at ({analysis['qr_code']['x']}, {analysis['qr_code']['y']})")
        print(f"🏷️  LAYOUT TYPE: {analysis['layout_type'].upper()}")
        print("="*50 + "\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 jpeg_analyzer.py <image_path>")
        sys.exit(1)
    
    analyzer = JPEGAnalyzer(sys.argv[1])
    analyzer.print_analysis()
