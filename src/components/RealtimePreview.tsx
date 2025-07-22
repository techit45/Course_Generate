import { StudySheetForm } from '@/types';
import { useRealtimePreview } from '@/hooks/useRealtimePreview';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

interface RealtimePreviewProps {
  formData: Partial<StudySheetForm>;
  className?: string;
}

export default function RealtimePreview({ formData, className = '' }: RealtimePreviewProps) {
  const previewData = useRealtimePreview(formData);

  // Show placeholder when no data
  if (!previewData) {
    return (
      <Card className={`${className} bg-gradient-to-br from-gray-50 to-gray-100`}>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">ตัวอย่างชีทเรียน</h3>
          <p className="text-gray-500">กรอกข้อมูลในฟอร์มเพื่อดูตัวอย่างแบบ Realtime</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-gradient-to-br from-login-learning-50 to-white border-login-learning-200`}>
      {/* Header */}
      <div className="mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-login-learning-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-login-learning-800 mb-1">
              📋 ตัวอย่างชีทเรียน
            </h3>
            <p className="text-login-learning-600 text-xs sm:text-sm">
              อัปเดตแบบ Realtime ตามการกรอกข้อมูล
            </p>
          </div>
          <div className="flex items-center space-x-2 self-start sm:self-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        <div className="bg-login-learning-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-login-learning-800">
            {previewData.estimatedPages}
          </div>
          <div className="text-xs text-login-learning-600">หน้า</div>
        </div>
        <div className="bg-login-learning-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-login-learning-800">
            {Math.floor(previewData.estimatedDuration / 60)}h {previewData.estimatedDuration % 60}m
          </div>
          <div className="text-xs text-login-learning-600">เวลาสอน</div>
        </div>
        <div className="bg-login-learning-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-login-learning-800">
            {previewData.sectionCount}
          </div>
          <div className="text-xs text-login-learning-600">หัวข้อ</div>
        </div>
        <div className="bg-login-learning-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-login-learning-800">
            {previewData.exerciseCount}
          </div>
          <div className="text-xs text-login-learning-600">แบบฝึกหัด</div>
        </div>
      </div>

      {/* Content Title */}
      <div className="mb-6">
        <h4 className="text-xl font-bold text-login-learning-800 mb-2">
          {previewData.contentStructure.title}
        </h4>
        <div className="flex items-center space-x-4 text-sm text-login-learning-600">
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 bg-login-learning-500 rounded-full mr-2"></span>
            {previewData.gradeInfo.level} ({previewData.gradeInfo.ageRange})
          </span>
        </div>
      </div>

      {/* Grade Level Info */}
      <div className="mb-6 p-4 bg-login-learning-50 border border-login-learning-200 rounded-lg">
        <h5 className="font-semibold text-login-learning-800 mb-2">
          📊 ข้อมูลระดับชั้น
        </h5>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-login-learning-700">ความซับซ้อน:</span>
            <span className="text-gray-600 ml-2">{previewData.gradeInfo.complexity}</span>
          </div>
          <div>
            <span className="font-medium text-login-learning-700">คำศัพท์:</span>
            <span className="text-gray-600 ml-2">{previewData.gradeInfo.vocabulary}</span>
          </div>
        </div>
      </div>

      {/* Time Distribution */}
      <div className="mb-6">
        <h5 className="font-semibold text-login-learning-800 mb-3">
          ⏰ การแบ่งเวลา (4 ชั่วโมง)
        </h5>
        <div className="space-y-3">
          {Object.entries(previewData.timeAllocation).map(([phase, minutes]) => {
            const percentage = (minutes / previewData.estimatedDuration) * 100;
            const phaseNames: Record<string, string> = {
              introduction: '🚀 บทนำ',
              mainContent: '📚 เนื้อหาหลัก',
              activities: '🎯 กิจกรรม',
              exercises: '✏️ แบบฝึกหัด',
              summary: '📝 สรุป'
            };
            
            return (
              <div key={phase} className="flex items-center space-x-3">
                <div className="w-24 text-sm font-medium text-login-learning-700">
                  {phaseNames[phase]}
                </div>
                <div className="flex-1">
                  <ProgressBar
                    progress={percentage}
                    size="sm"
                    color="primary"
                    className="mb-1"
                  />
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {minutes} นาที
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Sections Preview */}
      <div className="mb-6">
        <h5 className="font-semibold text-login-learning-800 mb-3">
          📖 โครงสร้างเนื้อหา
        </h5>
        <div className="space-y-3">
          {previewData.contentStructure.sections.map((section, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-white border border-login-learning-200 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-login-learning-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h6 className="font-medium text-gray-800 truncate">
                    {section.title}
                  </h6>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className={`px-2 py-1 rounded ${
                      section.type === 'theory' ? 'bg-blue-100 text-blue-700' :
                      section.type === 'explanation' ? 'bg-green-100 text-green-700' :
                      section.type === 'example' ? 'bg-yellow-100 text-yellow-700' :
                      section.type === 'practice' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {section.type === 'theory' ? 'ทฤษฎี' :
                       section.type === 'explanation' ? 'อธิบาย' :
                       section.type === 'example' ? 'ตัวอย่าง' :
                       section.type === 'practice' ? 'ฝึกปฏิบัติ' : 'สรุป'}
                    </span>
                    <span className="text-gray-500">
                      ⏱️ {section.duration} นาที
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Types Preview */}
      <div className="mb-6">
        <h5 className="font-semibold text-login-learning-800 mb-3">
          📝 ประเภทแบบฝึกหัด
        </h5>
        <div className="grid grid-cols-2 gap-3">
          {previewData.contentStructure.exerciseTypes.map((exercise, index) => (
            <div key={index} className="p-3 bg-white border border-login-learning-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-800">{exercise.type}</span>
                <span className="text-lg font-bold text-login-learning-600">
                  {exercise.count}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                ระดับ: {exercise.difficulty}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activities Preview */}
      <div className="mb-6">
        <h5 className="font-semibold text-login-learning-800 mb-3">
          🎪 กิจกรรมการเรียนรู้
        </h5>
        <div className="space-y-2">
          {previewData.contentStructure.activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white border border-login-learning-200 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-800">{activity.title}</div>
                <div className="text-sm text-gray-500">
                  ประเภท: {activity.type === 'group' ? 'กลุ่ม' :
                          activity.type === 'individual' ? 'รายบุคคล' :
                          activity.type === 'demonstration' ? 'สาธิต' : 'อภิปราย'}
                </div>
              </div>
              <div className="text-sm text-login-learning-600 font-medium">
                ⏱️ {activity.duration} นาที
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Distribution */}
      <div className="mb-6">
        <h5 className="font-semibold text-login-learning-800 mb-3">
          📊 การกระจายความยาก
        </h5>
        <div className="space-y-2">
          {Object.entries(previewData.difficultyDistribution).map(([level, percentage]) => {
            const levelNames = { easy: 'ง่าย', medium: 'ปานกลาง', hard: 'ยาก' };
            const colors = {
              easy: 'bg-green-500',
              medium: 'bg-yellow-500',
              hard: 'bg-red-500'
            };
            
            return (
              <div key={level} className="flex items-center space-x-3">
                <div className="w-16 text-sm font-medium text-gray-700">
                  {levelNames[level as keyof typeof levelNames]}
                </div>
                <div className="flex-1">
                  <ProgressBar
                    progress={percentage}
                    size="sm"
                    color={level === 'easy' ? 'success' : level === 'medium' ? 'warning' : 'error'}
                  />
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Note */}
      <div className="pt-4 border-t border-login-learning-200">
        <div className="flex items-center justify-center space-x-2 text-xs text-login-learning-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>ตัวอย่างนี้เป็นการประมาณการเบื้องต้น ผลลัพธ์จริงจาก AI อาจแตกต่างกันไป</span>
        </div>
      </div>
    </Card>
  );
}