import { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [subtitles, setSubtitles] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [frames, setFrames] = useState([]);

  const analyzeVideo = async () => {
    setError('');
    setResults(null);
    
    if (!videoFile) {
      setError('動画ファイルをアップロードしてください（現在YouTube URLは開発中です）');
      return;
    }
    
    setLoading(true);
    
    try {
      // ファイルから処理
      const extractedFrames = await extractFramesFromFile(videoFile);
      setFrames(extractedFrames);
      
      // Claude APIで分析
      const analysis = await analyzeWithClaude(extractedFrames, subtitles);
      setResults(analysis);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const extractFramesFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = async () => {
        const duration = Math.min(video.duration, 60);
        const frameCount = Math.min(8, Math.ceil(duration / 7.5));
        const interval = duration / frameCount;
        
        const extractedFrames = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        for (let i = 0; i < frameCount; i++) {
          const time = i * interval;
          video.currentTime = time;
          
          await new Promise(resolveFrame => {
            video.onseeked = () => {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0);
              
              canvas.toBlob(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  extractedFrames.push({
                    time: time.toFixed(1),
                    dataUrl: reader.result
                  });
                  resolveFrame();
                };
                reader.readAsDataURL(blob);
              }, 'image/jpeg', 0.8);
            };
          });
        }
        
        resolve(extractedFrames);
      };
      
      video.onerror = () => reject(new Error('動画の読み込みに失敗しました'));
      video.src = URL.createObjectURL(file);
    });
  };

  const analyzeWithClaude = async (frames, subtitleText) => {
    const content = [
      {
        type: "text",
        text: `あなたは環境法の専門家として、以下の動画のグリーンウォッシュ該当性を診断してください。

【分析する要素】
1. 視覚的要素：${frames.length}枚のキーフレームから、自然イメージの過剰使用、誤解を招く視覚表現
2. 文言・セリフ：${subtitleText ? '提供されたテキスト' : '字幕情報なし'}
3. 全体的印象：環境主張の具体性、根拠の有無、法規制との整合性

【診断基準】
- EU Green Claims Directive
- 日本の景品表示法（優良誤認）
- 消費者庁ガイドライン
- カーボンニュートラル表示の適切性

${subtitleText ? `【動画内テキスト】\n${subtitleText}\n` : ''}

【出力形式】
以下のJSON形式で出力してください：
{
  "riskLevel": "high" | "medium" | "low",
  "summary": "総合評価の要約",
  "visualAnalysis": "視覚的要素の分析",
  "textAnalysis": "文言の分析",
  "legalRisk": "法的リスク評価",
  "recommendations": ["改善提案1", "改善提案2", ...]
}

画像を確認して、詳細な診断を日本語で提供してください。JSON形式のみを出力し、他のテキストは含めないでください。`
      }
    ];
    
    // フレーム画像を追加
    for (const frame of frames) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: frame.dataUrl.split(',')[1]
        }
      });
    }
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content }]
      })
    });
    
    if (!response.ok) {
      throw new Error('AI分析に失敗しました');
    }
    
    const data = await response.json();
    const responseText = data.content[0].text;
    
    // JSONを抽出
    const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      return JSON.parse(jsonText);
    } catch (e) {
      throw new Error('分析結果の解析に失敗しました');
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'high': return <AlertCircle className="w-6 h-6" />;
      case 'medium': return <AlertTriangle className="w-6 h-6" />;
      case 'low': return <CheckCircle className="w-6 h-6" />;
      default: return null;
    }
  };

  const getRiskLabel = (level) => {
    switch (level) {
      case 'high': return '高リスク';
      case 'medium': return '中リスク';
      case 'low': return '低リスク';
      default: return '不明';
    }
  };

  return (
    <>
      <Head>
        <title>YouTube動画グリーンウォッシュ診断ツール</title>
        <meta name="description" content="環境訴求の適切性を多角的に分析します" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-black text-emerald-800 mb-3 tracking-tight">
              🌿 YouTube動画グリーンウォッシュ診断
            </h1>
            <p className="text-lg text-slate-600 font-light">
              環境訴求の適切性を多角的に分析します
            </p>
          </header>

          {/* Input Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-slate-200">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 mb-6 border-l-4 border-blue-500">
              <h4 className="text-blue-900 font-bold mb-2 text-lg">このツールについて</h4>
              <p className="text-blue-800 leading-relaxed">
                動画ファイル（60秒程度まで）をアップロードして、環境訴求表現のグリーンウォッシュ該当性を診断します。視覚要素、文言、全体的な印象を総合的にチェックします。
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-emerald-800 mb-2">
                  動画ファイルをアップロード（MP4, WebM, 60秒以内推奨）
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-600 transition-all outline-none"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block font-semibold text-emerald-800 mb-2">
                  字幕・セリフテキスト（オプション）
                </label>
                <textarea
                  value={subtitles}
                  onChange={(e) => setSubtitles(e.target.value)}
                  rows={4}
                  placeholder="動画内の文言やセリフをここに貼り付けてください"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
                  disabled={loading}
                />
              </div>

              <button
                onClick={analyzeVideo}
                disabled={loading || !videoFile}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    分析中...
                  </>
                ) : (
                  '診断を開始'
                )}
              </button>
            </div>

            {error && (
              <div className="mt-5 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}

            {loading && (
              <div className="mt-6 text-center animate-fade-in">
                <p className="text-slate-600 mb-2">動画を分析中です...</p>
                <p className="text-sm text-slate-500">
                  キーフレーム抽出とAI分析を実行しています（30〜60秒程度かかります）
                </p>
              </div>
            )}
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-6 animate-fade-in">
              {/* Risk Level Card */}
              <div className={`rounded-2xl shadow-xl p-6 md:p-8 border-2 ${getRiskColor(results.riskLevel)}`}>
                <div className="flex items-center gap-4 mb-4">
                  {getRiskIcon(results.riskLevel)}
                  <div>
                    <h2 className="text-2xl font-black">診断結果</h2>
                    <p className="text-lg font-bold mt-1">
                      グリーンウォッシュリスク: {getRiskLabel(results.riskLevel)}
                    </p>
                  </div>
                </div>
                <p className="text-lg leading-relaxed">{results.summary}</p>
              </div>

              {/* Detailed Analysis */}
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200">
                <h3 className="text-2xl font-bold text-emerald-800 mb-6 border-l-4 border-amber-400 pl-4">
                  詳細分析
                </h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-emerald-700 mb-3">視覚的要素の分析</h4>
                    <p className="text-slate-700 leading-relaxed">{results.visualAnalysis}</p>
                  </div>

                  {results.textAnalysis && (
                    <div>
                      <h4 className="text-lg font-bold text-emerald-700 mb-3">文言の分析</h4>
                      <p className="text-slate-700 leading-relaxed">{results.textAnalysis}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-lg font-bold text-emerald-700 mb-3">法的リスク評価</h4>
                    <p className="text-slate-700 leading-relaxed">{results.legalRisk}</p>
                  </div>

                  {results.recommendations && results.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-emerald-700 mb-3">改善提案</h4>
                      <ul className="space-y-2">
                        {results.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-amber-500 font-bold mt-1">→</span>
                            <span className="text-slate-700 leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Frames Display */}
              {frames.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200">
                  <h3 className="text-2xl font-bold text-emerald-800 mb-6 border-l-4 border-amber-400 pl-4">
                    抽出されたキーフレーム
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {frames.map((frame, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                        <img src={frame.dataUrl} alt={`Frame ${idx + 1}`} className="w-full h-auto" />
                        <div className="bg-emerald-700 text-white text-center py-2 text-sm font-semibold">
                          {frame.time}秒
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }

          .animate-shake {
            animation: shake 0.4s ease-out;
          }
        `}</style>
      </div>
    </>
  );
}