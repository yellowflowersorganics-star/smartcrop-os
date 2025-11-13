import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sopService } from '../services/api';
import { ArrowLeft, CheckCircle, Circle, AlertTriangle, Save } from 'lucide-react';

const SOPExecution = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sop, setSOP] = useState(null);
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchSOP();
  }, [id]);

  const fetchSOP = async () => {
    try {
      setLoading(true);
      const res = await sopService.getById(id);
      setSOP(res.data);
      
      // Start execution
      const execRes = await sopService.startExecution({ sopId: id });
      setExecution(execRes.data);
    } catch (error) {
      console.error('Error fetching SOP:', error);
      alert('Failed to load SOP');
      navigate('/sop');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStep = async (stepNumber) => {
    try {
      await sopService.completeStep(execution.id, {
        stepNumber,
        stepData: { completedAt: new Date() }
      });
      
      setCompletedSteps([...completedSteps, stepNumber]);
      if (stepNumber < sop.steps.length) {
        setCurrentStep(stepNumber + 1);
      }
    } catch (error) {
      console.error('Error completing step:', error);
      alert('Failed to complete step');
    }
  };

  const handleComplete = async () => {
    try {
      await sopService.completeExecution(execution.id, {
        outcome: 'success',
        successCriteriaMet: true
      });
      
      alert('SOP execution completed successfully!');
      navigate('/sop');
    } catch (error) {
      console.error('Error completing execution:', error);
      alert('Failed to complete execution');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!sop) return null;

  const progress = Math.round((completedSteps.length / sop.steps.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/sop" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{sop.title}</h1>
          <p className="text-gray-600 mt-1">SOP #{sop.sopNumber}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {completedSteps.length} of {sop.steps.length} steps completed
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {sop.steps.map((step, index) => {
          const stepNumber = step.stepNumber || index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = currentStep === stepNumber;

          return (
            <div
              key={step.id}
              className={`bg-white p-6 rounded-lg shadow-md ${
                isCurrent ? 'ring-2 ring-green-500' : ''
              } ${isCompleted ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {isCompleted ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <Circle className="w-8 h-8 text-gray-300" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Step {stepNumber}: {step.title}
                      </h3>
                      {step.isCritical && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 mt-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          Critical
                        </span>
                      )}
                    </div>
                    
                    {!isCompleted && (
                      <button
                        onClick={() => handleCompleteStep(stepNumber)}
                        className="btn-primary px-4 py-2 text-sm"
                      >
                        Complete
                      </button>
                    )}
                  </div>

                  <p className="text-gray-600 mt-3 whitespace-pre-wrap">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Execution */}
      {completedSteps.length === sop.steps.length && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                All steps completed! 🎉
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Ready to finalize this execution
              </p>
            </div>
            <button
              onClick={handleComplete}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Save className="w-5 h-5" />
              Complete Execution
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOPExecution;

