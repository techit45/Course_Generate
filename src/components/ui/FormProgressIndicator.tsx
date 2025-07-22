import { StudySheetForm } from '@/types';

interface FormProgressIndicatorProps {
  formData: Partial<StudySheetForm>;
  className?: string;
}

const fieldLabels: Record<keyof StudySheetForm, string> = {
  topic: 'หัวข้อการเรียน',
  gradeLevel: 'ระดับชั้น',
  contentAmount: 'ปริมาณเนื้อหา',
  exerciseAmount: 'ปริมาณแบบฝึกหัด'
};

export default function FormProgressIndicator({ 
  formData, 
  className = '' 
}: FormProgressIndicatorProps) {
  const fields = Object.keys(fieldLabels) as (keyof StudySheetForm)[];
  
  const getFieldStatus = (field: keyof StudySheetForm) => {
    const value = formData[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'empty';
    }
    return 'completed';
  };

  const completedCount = fields.filter(field => getFieldStatus(field) === 'completed').length;
  const progress = (completedCount / fields.length) * 100;

  return (
    <div className={`bg-white rounded-lg p-4 border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">ความคืบหน้าการกรอกข้อมูล</h3>
        <span className="text-sm text-gray-500">{completedCount}/{fields.length}</span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-gradient-to-r from-login-learning-500 to-login-learning-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Field Status List */}
      <div className="space-y-2">
        {fields.map((field) => {
          const status = getFieldStatus(field);
          return (
            <div key={field} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{fieldLabels[field]}</span>
              <div className="flex items-center">
                {status === 'completed' ? (
                  <div className="flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">เสร็จสิ้น</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">รอดำเนินการ</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Status */}
      {progress === 100 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-800">
              พร้อมสร้างชีทเรียน!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}