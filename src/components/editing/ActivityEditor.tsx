'use client';

import React, { useState } from 'react';
import { Activity } from '@/types';

interface ActivityEditorProps {
  activity: Activity;
  index: number;
  onUpdate: (updatedActivity: Activity) => void;
  onDelete: () => void;
  isReadonly?: boolean;
}

export const ActivityEditor: React.FC<ActivityEditorProps> = ({
  activity,
  index,
  onUpdate,
  onDelete,
  isReadonly = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = (field: keyof Activity, value: any) => {
    onUpdate({
      ...activity,
      [field]: value
    });
  };

  const handleMaterialAdd = () => {
    const newMaterial = prompt('เพิ่มวัสดุอุปกรณ์:');
    if (newMaterial && newMaterial.trim()) {
      handleUpdate('materials', [...activity.materials, newMaterial.trim()]);
    }
  };

  const handleMaterialUpdate = (materialIndex: number, value: string) => {
    const updatedMaterials = [...activity.materials];
    updatedMaterials[materialIndex] = value;
    handleUpdate('materials', updatedMaterials);
  };

  const handleMaterialRemove = (materialIndex: number) => {
    const updatedMaterials = activity.materials.filter((_, i) => i !== materialIndex);
    handleUpdate('materials', updatedMaterials);
  };

  const handleInstructionAdd = () => {
    const newInstruction = prompt('เพิ่มขั้นตอน:');
    if (newInstruction && newInstruction.trim()) {
      handleUpdate('instructions', [...activity.instructions, newInstruction.trim()]);
    }
  };

  const handleInstructionUpdate = (instructionIndex: number, value: string) => {
    const updatedInstructions = [...activity.instructions];
    updatedInstructions[instructionIndex] = value;
    handleUpdate('instructions', updatedInstructions);
  };

  const handleInstructionRemove = (instructionIndex: number) => {
    const updatedInstructions = activity.instructions.filter((_, i) => i !== instructionIndex);
    handleUpdate('instructions', updatedInstructions);
  };

  const handleCriteriaAdd = () => {
    const newCriteria = prompt('เพิ่มเกณฑ์การประเมิน:');
    if (newCriteria && newCriteria.trim()) {
      handleUpdate('assessmentCriteria', [...(activity.assessmentCriteria || []), newCriteria.trim()]);
    }
  };

  const handleCriteriaRemove = (criteriaIndex: number) => {
    const updatedCriteria = (activity.assessmentCriteria || []).filter((_, i) => i !== criteriaIndex);
    handleUpdate('assessmentCriteria', updatedCriteria);
  };

  const getActivityTypeText = (type: Activity['type']) => {
    const typeMap = {
      'individual': 'รายบุคคล',
      'group': 'กลุ่ม',
      'demonstration': 'สาธิต',
      'discussion': 'อภิปราย'
    };
    return typeMap[type] || type;
  };

  const getActivityTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'individual': return 'bg-blue-100 text-blue-800';
      case 'group': return 'bg-green-100 text-green-800';
      case 'demonstration': return 'bg-purple-100 text-purple-800';
      case 'discussion': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Activity Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">กิจกรรมที่ {index + 1}</span>
              <span className={`px-2 py-1 rounded text-xs ${getActivityTypeColor(activity.type)}`}>
                {getActivityTypeText(activity.type)}
              </span>
              <span className="text-xs text-gray-500">⏱️ {activity.duration} นาที</span>
            </div>
            <h3 className="font-medium text-gray-900">{activity.title}</h3>
          </div>
        </div>

        {!isReadonly && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="ลบกิจกรรม"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อกิจกรรม
            </label>
            <input
              type="text"
              value={activity.title}
              onChange={(e) => handleUpdate('title', e.target.value)}
              disabled={isReadonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="ชื่อกิจกรรม..."
            />
          </div>

          {/* Type and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทกิจกรรม
              </label>
              <select
                value={activity.type}
                onChange={(e) => handleUpdate('type', e.target.value as Activity['type'])}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="individual">รายบุคคล</option>
                <option value="group">กลุ่ม</option>
                <option value="demonstration">สาธิต</option>
                <option value="discussion">อภิปราย</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ระยะเวลา (นาที)
              </label>
              <input
                type="number"
                value={activity.duration}
                onChange={(e) => handleUpdate('duration', parseInt(e.target.value) || 0)}
                disabled={isReadonly}
                min="5"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบายกิจกรรม
            </label>
            <textarea
              value={activity.description}
              onChange={(e) => handleUpdate('description', e.target.value)}
              disabled={isReadonly}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="อธิบายรายละเอียดของกิจกรรม..."
            />
          </div>

          {/* Materials */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                วัสดุอุปกรณ์
              </label>
              {!isReadonly && (
                <button
                  onClick={handleMaterialAdd}
                  className="text-sm text-login-learning-600 hover:text-login-learning-800"
                >
                  + เพิ่มวัสดุ
                </button>
              )}
            </div>
            <div className="space-y-2">
              {activity.materials.map((material, materialIndex) => (
                <div key={materialIndex} className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gray-100 rounded-full text-xs flex items-center justify-center flex-shrink-0">
                    {materialIndex + 1}
                  </span>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => handleMaterialUpdate(materialIndex, e.target.value)}
                    disabled={isReadonly}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder={`วัสดุที่ ${materialIndex + 1}`}
                  />
                  {!isReadonly && activity.materials.length > 1 && (
                    <button
                      onClick={() => handleMaterialRemove(materialIndex)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                ขั้นตอนการทำกิจกรรม
              </label>
              {!isReadonly && (
                <button
                  onClick={handleInstructionAdd}
                  className="text-sm text-login-learning-600 hover:text-login-learning-800"
                >
                  + เพิ่มขั้นตอน
                </button>
              )}
            </div>
            <div className="space-y-2">
              {activity.instructions.map((instruction, instructionIndex) => (
                <div key={instructionIndex} className="flex items-start space-x-2">
                  <span className="w-6 h-6 bg-login-learning-100 text-login-learning-700 rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-1">
                    {instructionIndex + 1}
                  </span>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleInstructionUpdate(instructionIndex, e.target.value)}
                    disabled={isReadonly}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder={`ขั้นตอนที่ ${instructionIndex + 1}`}
                  />
                  {!isReadonly && activity.instructions.length > 1 && (
                    <button
                      onClick={() => handleInstructionRemove(instructionIndex)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expected Outcome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ผลลัพธ์ที่คาดหวัง
            </label>
            <textarea
              value={activity.expectedOutcome}
              onChange={(e) => handleUpdate('expectedOutcome', e.target.value)}
              disabled={isReadonly}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="อธิบายผลลัพธ์ที่คาดหวังจากกิจกรรมนี้..."
            />
          </div>

          {/* Assessment Criteria */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                เกณฑ์การประเมิน (ไม่บังคับ)
              </label>
              {!isReadonly && (
                <button
                  onClick={handleCriteriaAdd}
                  className="text-sm text-login-learning-600 hover:text-login-learning-800"
                >
                  + เพิ่มเกณฑ์
                </button>
              )}
            </div>
            <div className="space-y-1">
              {(activity.assessmentCriteria || []).map((criteria, criteriaIndex) => (
                <div key={criteriaIndex} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm">{criteria}</span>
                  {!isReadonly && (
                    <button
                      onClick={() => handleCriteriaRemove(criteriaIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการลบกิจกรรม
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการลบกิจกรรม "{activity.title}" หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};