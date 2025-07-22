'use client';

import React, { useState } from 'react';
import { recommendedFreeModels, getRecommendedModelForContent, ModelInfo } from '@/config/freeModels';
import { GradeLevel, ContentAmount } from '@/types';
import Card from '@/components/ui/Card';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  gradeLevel?: GradeLevel;
  contentAmount?: ContentAmount;
  className?: string;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  gradeLevel,
  contentAmount,
  className = ''
}: ModelSelectorProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // แนะนำโมเดลตามเงื่อนไข
  const recommendedModel = gradeLevel && contentAmount 
    ? getRecommendedModelForContent(gradeLevel, contentAmount)
    : recommendedFreeModels[0];

  const getLanguageSupportBadge = (support: ModelInfo['thaiLanguageSupport']) => {
    const badges = {
      excellent: { color: 'bg-green-100 text-green-800', text: 'ไทยดีเยี่ยม' },
      good: { color: 'bg-blue-100 text-blue-800', text: 'ไทยดี' },
      fair: { color: 'bg-yellow-100 text-yellow-800', text: 'ไทยพอใช้' },
      limited: { color: 'bg-red-100 text-red-800', text: 'ไทยจำกัด' }
    };
    return badges[support];
  };

  const getSpeedBadge = (speed: ModelInfo['speed']) => {
    const badges = {
      fast: { color: 'bg-emerald-100 text-emerald-800', text: '⚡ เร็ว' },
      medium: { color: 'bg-orange-100 text-orange-800', text: '⏱️ ปานกลาง' },
      slow: { color: 'bg-red-100 text-red-800', text: '🐌 ช้า' }
    };
    return badges[speed];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* หัวข้อและปุ่มรายละเอียด */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">เลือก AI Model</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-login-learning-600 hover:text-login-learning-800 flex items-center"
        >
          <span className="mr-1">{showDetails ? '▼' : '▶'}</span>
          รายละเอียด
        </button>
      </div>

      {/* แนะนำโมเดล */}
      {recommendedModel && selectedModel !== recommendedModel.id && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-blue-900">
                แนะนำ: {recommendedModel.name}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                เหมาะสำหรับเงื่อนไขของคุณ (ระดับ {gradeLevel}, เนื้อหา{contentAmount})
              </p>
              <button
                onClick={() => onModelChange(recommendedModel.id)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
              >
                ใช้โมเดลที่แนะนำ →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* รายการโมเดล */}
      <div className="space-y-3">
        {recommendedFreeModels.map((model) => (
          <div
            key={model.id}
            className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
              selectedModel === model.id
                ? 'border-login-learning-500 bg-login-learning-50 ring-2 ring-login-learning-500 ring-opacity-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => onModelChange(model.id)}
          >
            {/* Radio button */}
            <div className="flex items-start">
              <input
                type="radio"
                name="model"
                value={model.id}
                checked={selectedModel === model.id}
                onChange={() => onModelChange(model.id)}
                className="mt-1 h-4 w-4 text-login-learning-600 focus:ring-login-learning-500 border-gray-300"
              />
              
              <div className="ml-3 flex-1">
                {/* หัวข้อและชื่อ */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {model.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {model.provider}
                    </p>
                  </div>
                  
                  {/* คะแนนการศึกษา */}
                  <div className="flex items-center space-x-2">
                    <div className="text-xs bg-login-learning-100 text-login-learning-800 px-2 py-1 rounded">
                      📚 {model.educationScore}/10
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${getLanguageSupportBadge(model.thaiLanguageSupport).color}`}>
                      {getLanguageSupportBadge(model.thaiLanguageSupport).text}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${getSpeedBadge(model.speed).color}`}>
                      {getSpeedBadge(model.speed).text}
                    </div>
                  </div>
                </div>

                {/* คำอธิบาย */}
                <p className="text-sm text-gray-600 mt-2">
                  {model.description}
                </p>

                {/* แสดงรายละเอียดเมื่อขยาย */}
                {showDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* ข้อดี */}
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">✅ ข้อดี:</h5>
                        <ul className="space-y-1 text-green-600">
                          {model.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* ข้อเสีย */}
                      <div>
                        <h5 className="font-medium text-red-700 mb-2">⚠️ ข้อเสีย:</h5>
                        <ul className="space-y-1 text-red-600">
                          {model.weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* เหมาะสำหรับ */}
                    <div className="mt-4">
                      <h5 className="font-medium text-blue-700 mb-2">🎯 เหมาะสำหรับ:</h5>
                      <div className="flex flex-wrap gap-1">
                        {model.bestFor.map((use, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                          >
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ข้อมูลเทคนิค */}
                    <div className="mt-4 bg-gray-50 rounded p-3">
                      <h5 className="font-medium text-gray-700 mb-2">🔧 ข้อมูลเทคนิค:</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>Context Window: {model.contextWindow.toLocaleString()} tokens</div>
                        <div>Max Tokens: {model.config.maxTokens}</div>
                        <div>Temperature: {model.config.temperature}</div>
                        <div>Timeout: {model.config.timeout}ms</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* สรุปการเปรียบเทียบ */}
      {showDetails && (
        <Card className="mt-6 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">📊 สรุปการเปรียบเทียบ</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 mb-1">🏆 ดีที่สุดโดยรวม:</div>
              <div className="font-medium text-login-learning-800">Phi-3 Mini 128K</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">⚡ เร็วที่สุด:</div>
              <div className="font-medium text-green-800">Llama 3.2 3B</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">🇹🇭 ภาษาไทยดีที่สุด:</div>
              <div className="font-medium text-blue-800">Phi-3 Mini 128K</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">🎨 สร้างสรรค์ที่สุด:</div>
              <div className="font-medium text-purple-800">Zephyr 7B</div>
            </div>
          </div>
        </Card>
      )}

      {/* คำแนะนำการใช้งาน */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-900">
              💡 คำแนะนำ
            </h4>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• <strong>เนื้อหาสั้น:</strong> ใช้ Llama 3.2 3B (เร็ว)</li>
              <li>• <strong>เนื้อหายาว:</strong> ใช้ Phi-3 Mini (Context ใหญ่)</li>
              <li>• <strong>ต้องการความคิดสร้างสรรค์:</strong> ใช้ Zephyr 7B</li>
              <li>• <strong>คำอธิบายชัดเจน:</strong> ใช้ OpenChat 7B</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}