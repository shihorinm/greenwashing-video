from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import subprocess
import base64
import uuid
import shutil
from pathlib import Path

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)

# 一時ファイル用ディレクトリ
TEMP_DIR = Path('./temp')
TEMP_DIR.mkdir(exist_ok=True)

@app.route('/')
def index():
    """フロントエンドを提供"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/extract-youtube-frames', methods=['POST'])
def extract_youtube_frames():
    """YouTube動画からキーフレームを抽出"""
    data = request.json
    video_url = data.get('videoUrl')
    max_duration = data.get('maxDuration', 60)
    
    if not video_url:
        return jsonify({'error': 'videoUrl is required'}), 400
    
    # セッションIDを生成
    session_id = str(uuid.uuid4())
    session_dir = TEMP_DIR / session_id
    session_dir.mkdir(exist_ok=True)
    
    video_path = session_dir / 'video.mp4'
    frames_dir = session_dir / 'frames'
    frames_dir.mkdir(exist_ok=True)
    
    try:
        # Step 1: yt-dlpで動画をダウンロード
        print(f"Downloading video from: {video_url}")
        
        # YouTube URLを正規化
        if 'youtu.be' in video_url or 'youtube.com' in video_url:
            yt_url = video_url
        else:
            return jsonify({'error': 'Invalid YouTube URL'}), 400
        
        # yt-dlpコマンド（最初のN秒のみダウンロード）
        yt_cmd = [
            'yt-dlp',
            '-f', 'best[height<=720]',
            '--download-sections', f'*0-{max_duration}',
            '-o', str(video_path),
            yt_url
        ]
        
        result = subprocess.run(yt_cmd, capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            print(f"yt-dlp error: {result.stderr}")
            return jsonify({'error': 'Failed to download video', 'details': result.stderr}), 500
        
        # Step 2: ffprobeで動画の長さを取得
        ffprobe_cmd = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            str(video_path)
        ]
        
        result = subprocess.run(ffprobe_cmd, capture_output=True, text=True)
        duration = min(float(result.stdout.strip()), max_duration)
        
        # Step 3: キーフレーム数を計算
        frame_count = min(8, max(1, int(duration / 7.5)))
        interval = duration / frame_count
        
        print(f"Extracting {frame_count} frames from {duration:.1f}s video")
        
        # Step 4: ffmpegでキーフレームを抽出
        frames = []
        
        for i in range(frame_count):
            time = i * interval
            frame_path = frames_dir / f'frame_{i}.jpg'
            
            ffmpeg_cmd = [
                'ffmpeg',
                '-ss', str(time),
                '-i', str(video_path),
                '-vframes', '1',
                '-q:v', '2',
                str(frame_path)
            ]
            
            subprocess.run(ffmpeg_cmd, capture_output=True, timeout=30)
            
            # 画像をBase64に変換
            with open(frame_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
                frames.append({
                    'time': f'{time:.1f}',
                    'dataUrl': f'data:image/jpeg;base64,{image_data}'
                })
        
        print(f"Successfully extracted {len(frames)} frames")
        
        return jsonify({
            'success': True,
            'frames': frames,
            'duration': f'{duration:.1f}'
        })
    
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Video processing timeout'}), 500
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        # クリーンアップ
        try:
            shutil.rmtree(session_dir)
        except:
            pass

@app.route('/health')
def health():
    """ヘルスチェック"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
