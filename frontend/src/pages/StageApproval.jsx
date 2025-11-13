import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipeExecutionService } from '../services/recipeExecution.service';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const StageApproval = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [manualTasksCompleted, setManualTasksCompleted] = useState({});

  useEffect(() => {
    if (id) {
      fetchExecution();
      // Refresh every 10 seconds
      const interval = setInterval(fetchExecution, 10000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const fetchExecution = async () => {
    try {
      const data = await recipeExecutionService.getRecipeExecutionById(id);
      setExecution(data);
      
      // Initialize manual tasks checkboxes
      if (data.pendingApproval && data.pendingApproval.manualTasks) {
        const tasks = {};
        data.pendingApproval.manualTasks.forEach((task, index) => {
          tasks[index] = false;
        });
        setManualTasksCompleted(tasks);
      }
    } catch (error) {
      showToast(error.message || 'Failed to load recipe execution', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    // Check if all manual tasks are completed
    const allTasksCompleted = Object.values(manualTasksCompleted).every(Boolean);
    
    if (execution.pendingApproval?.manualTasks?.length > 0 && !allTasksCompleted) {
      showToast('Please complete all manual tasks before approving', 'warning');
      return;
    }
    
    setApproving(true);
    try {
      await recipeExecutionService.approveStage(id);
      showToast('Stage transition approved! Zone transitioning to next stage...', 'success');
      setTimeout(() => {
        navigate(`/recipe-executions/${id}`);
      }, 2000);
    } catch (error) {
      showToast(error.message || 'Failed to approve stage transition', 'error');
    } finally {
      setApproving(false);
      setShowApproveModal(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      showToast('Please provide a reason for declining', 'warning');
      return;
    }
    
    setDeclining(true);
    try {
      await recipeExecutionService.declineStage(id, declineReason);
      showToast('Stage transition declined', 'info');
      setTimeout(() => {
        navigate(`/recipe-executions/${id}`);
      }, 1500);
    } catch (error) {
      showToast(error.message || 'Failed to decline stage transition', 'error');
    } finally {
      setDeclining(false);
      setShowDeclineModal(false);
    }
  };

  const getStageIcon = (stageName) => {
    const lower = stageName?.toLowerCase() || '';
    if (lower.includes('incubat')) return '🌡️';
    if (lower.includes('fruit')) return '🍄';
    if (lower.includes('harvest')) return '✂️';
    if (lower.includes('spawn')) return '🌱';
    if (lower.includes('coloniz')) return '🦠';
    return '📊';
  };

  const getDaysInStage = () => {
    if (!execution || !execution.currentStageStartedAt) return 0;
    const start = new Date(execution.currentStageStartedAt);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recipe Execution Not Found</h2>
        <Link to="/recipe-executions" className="text-green-600 hover:text-green-700">
          ← Back to Recipe Executions
        </Link>
      </div>
    );
  }

  if (!execution.pendingApproval) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Pending Approval</h2>
        <p className="text-gray-600 mb-6">This recipe execution does not require approval at this time.</p>
        <Link to={`/recipe-executions/${id}`} className="btn btn-primary">
          View Recipe Execution Details
        </Link>
      </div>
    );
  }

  const { pendingApproval } = execution;
  const currentStage = execution.Recipe?.stages?.[execution.currentStage] || {};
  const nextStage = execution.Recipe?.stages?.[execution.currentStage + 1] || {};
  const daysInStage = getDaysInStage();

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/recipe-executions" className="text-green-600 hover:text-green-700 font-medium mb-2 inline-block">
          ← Back to Recipe Executions
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Stage Transition Approval</h1>
        <p className="text-gray-600 mt-1">Review and approve the transition to the next growth stage</p>
      </div>

      {/* Alert Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 font-medium">
              ⏰ Approval Required! This recipe execution is waiting for your confirmation to proceed.
            </p>
          </div>
        </div>
      </div>

      {/* Current Stage Info */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Current Stage</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{getStageIcon(currentStage.name)}</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{currentStage.name}</h3>
              <p className="text-gray-600">Stage {execution.currentStage + 1} of {execution.Recipe?.stages?.length || 0}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">{daysInStage}</div>
              <div className="text-sm text-gray-600">Days Completed</div>
            </div>
          </div>

          {/* Stage Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div>
              <div className="text-sm text-gray-600 mb-1">Temperature</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentStage.temperature?.optimal || '-'}°C
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Humidity</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentStage.humidity?.optimal || '-'}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">CO₂</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentStage.co2?.optimal || '-'} ppm
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Light</div>
              <div className="text-lg font-semibold text-gray-900">
                {currentStage.light || 0} lux
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transition Arrow */}
      <div className="flex justify-center my-6">
        <div className="bg-green-100 rounded-full p-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Next Stage Info */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden border-2 border-green-200">
        <div className="bg-gradient-to-r from-green-100 to-blue-100 px-6 py-4 border-b border-green-200">
          <h2 className="text-xl font-semibold text-gray-900">Next Stage (Pending Approval)</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{getStageIcon(nextStage.name)}</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{nextStage.name}</h3>
              <p className="text-gray-600">Stage {execution.currentStage + 2} of {execution.Recipe?.stages?.length || 0}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{nextStage.duration || 0}</div>
              <div className="text-sm text-gray-600">Days Duration</div>
            </div>
          </div>

          {/* Stage Changes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <StageComparison
              label="Temperature"
              current={currentStage.temperature?.optimal}
              next={nextStage.temperature?.optimal}
              unit="°C"
            />
            <StageComparison
              label="Humidity"
              current={currentStage.humidity?.optimal}
              next={nextStage.humidity?.optimal}
              unit="%"
            />
            <StageComparison
              label="CO₂"
              current={currentStage.co2?.optimal}
              next={nextStage.co2?.optimal}
              unit=" ppm"
            />
            <StageComparison
              label="Light"
              current={currentStage.light}
              next={nextStage.light}
              unit=" lux"
            />
          </div>

          {/* Expected Changes */}
          {pendingApproval.message && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📋 Expected Changes</h4>
              <p className="text-blue-800">{pendingApproval.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Tasks */}
      {pendingApproval.manualTasks && pendingApproval.manualTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden border-2 border-orange-200">
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-6 py-4 border-b border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900">⚠️ Manual Tasks Required</h2>
            <p className="text-sm text-gray-600 mt-1">Please complete these tasks before approving the transition</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {pendingApproval.manualTasks.map((task, index) => (
                <label
                  key={index}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    manualTasksCompleted[index]
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={manualTasksCompleted[index] || false}
                    onChange={(e) => setManualTasksCompleted({
                      ...manualTasksCompleted,
                      [index]: e.target.checked
                    })}
                    className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className={`font-medium ${manualTasksCompleted[index] ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                      {task}
                    </div>
                  </div>
                  {manualTasksCompleted[index] && (
                    <span className="text-green-600 font-semibold">✓ Done</span>
                  )}
                </label>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Tasks Completed</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Object.values(manualTasksCompleted).filter(Boolean).length} / {pendingApproval.manualTasks.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Object.values(manualTasksCompleted).filter(Boolean).length / pendingApproval.manualTasks.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone & Recipe Info */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Execution Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Zone:</span>
            <div className="font-semibold text-gray-900 mt-1">{execution.Zone?.name || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-600">Recipe:</span>
            <div className="font-semibold text-gray-900 mt-1">{execution.Recipe?.name || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-600">Batch:</span>
            <div className="font-semibold text-gray-900 mt-1">{execution.Batch?.batchNumber || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-600">Started:</span>
            <div className="font-semibold text-gray-900 mt-1">
              {execution.startedAt ? new Date(execution.startedAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowDeclineModal(true)}
            disabled={declining || approving}
            className="flex-1 btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {declining ? 'Declining...' : '❌ Decline Transition'}
          </button>
          <button
            onClick={() => setShowApproveModal(true)}
            disabled={approving || declining}
            className="flex-1 btn btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {approving ? 'Approving...' : '✅ Approve & Start Transition'}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium text-gray-900 mb-1">ℹ️ What happens after approval?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>The zone will automatically transition to the next stage</li>
            <li>Environmental conditions will adjust according to the new stage</li>
            <li>Equipment settings will be updated</li>
            <li>You'll be able to monitor the transition progress</li>
          </ul>
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Stage Transition?"
        message={`Are you sure you want to approve the transition from "${currentStage.name}" to "${nextStage.name}"? This will immediately start the transition process.`}
        confirmText="Yes, Approve Transition"
        cancelText="Cancel"
        confirmButtonClass="btn btn-primary"
      />

      {/* Decline Modal with Reason */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Decline Stage Transition</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for declining this stage transition:
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g., Bags not ready, quality issues, equipment failure..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="4"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                }}
                disabled={declining}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={declining || !declineReason.trim()}
                className="flex-1 btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {declining ? 'Declining...' : 'Decline Transition'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stage Comparison Component
const StageComparison = ({ label, current, next, unit = '' }) => {
  const currentVal = current || 0;
  const nextVal = next || 0;
  const change = nextVal - currentVal;
  const changePercent = currentVal ? ((change / currentVal) * 100).toFixed(0) : 0;
  
  return (
    <div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-lg font-semibold text-gray-900">
          {nextVal}{unit}
        </div>
        {change !== 0 && (
          <div className={`text-xs font-medium ${change > 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {change > 0 ? '▲' : '▼'} {Math.abs(change)}{unit}
          </div>
        )}
      </div>
      {change !== 0 && changePercent !== 0 && (
        <div className="text-xs text-gray-500 mt-1">
          ({changePercent > 0 ? '+' : ''}{changePercent}%)
        </div>
      )}
    </div>
  );
};

export default StageApproval;

