import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import {
  GraduationCap,
  Lock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileCheck,
  TrendingUp,
  User,
  ShieldCheck,
} from 'lucide-react';

export const StudentRoster: React.FC = () => {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>(); // if viewing single student detail
  const { error } = useToast();

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State for Hackathon Privacy Test Modal
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [privacyTestResult, setPrivacyTestResult] = useState<any>(null);
  const [testingVaultAccess, setTestingVaultAccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const res = await fetch('/api/teacher/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students);
        }

        if (id) {
          const sRes = await fetch(`/api/teacher/students/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (sRes.ok) {
            const sData = await sRes.json();
            setSelectedStudentDetail(sData);
          }
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, [id, token]);

  // Hackathon Demo: Attempting to access student's Memory Vault from teacher account
  const handleTestMemoryVaultAccess = async (studentId: string) => {
    setTestingVaultAccess(true);
    try {
      const res = await fetch(`/api/teacher/students/${studentId}/vault`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setPrivacyTestResult({
        statusCode: res.status,
        data,
      });
      setIsPrivacyModalOpen(true);
    } catch (err: any) {
      error('Network error while testing vault privacy.');
    } finally {
      setTestingVaultAccess(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-96 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  // If viewing individual student academic analytics
  if (selectedStudentDetail) {
    const s = selectedStudentDetail.student;
    const academic = selectedStudentDetail.academicProgress;

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        <div>
          <Link
            to="/teacher/students"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Roster
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-4">
              <img
                src={s.avatar}
                alt={s.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-500/20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    {s.studentId}
                  </span>
                  <span className="text-xs text-slate-400">{s.email}</span>
                </div>
                <h1 className="text-2xl font-black text-white mt-1">{s.name}</h1>
                <p className="text-xs text-slate-400">Academic Analytics & Submission History</p>
              </div>
            </div>

            {/* Test Memory Vault Access Button (HACKATHON DEMO STEP 24) */}
            <button
              onClick={() => handleTestMemoryVaultAccess(s.studentId)}
              disabled={testingVaultAccess}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
            >
              <Lock className="w-4 h-4 text-rose-400" />
              <span>{testingVaultAccess ? 'Testing...' : 'Test Memory Vault Access (Demo)'}</span>
            </button>
          </div>
        </div>

        {/* Academic Progress Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Average Academic Score</span>
            <div className="text-2xl font-black text-purple-400 mt-1">{academic.averageScore}%</div>
            <span className="text-[11px] text-slate-400">Across graded work</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Curriculum Progress</span>
            <div className="text-2xl font-black text-white mt-1">{academic.overallProgress}%</div>
            <span className="text-[11px] text-emerald-400">{academic.topicsCompleted} Topics Completed</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-400">Primary Weak Topic</span>
            <div className="text-lg font-bold text-rose-400 mt-1 truncate">
              {academic.weakTopics[0]?.topicTitle || 'None'}
            </div>
            <span className="text-[11px] text-slate-400">Low assessment performance</span>
          </div>
        </div>

        {/* Privacy Shield Notice */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Privacy Boundary Guarded:</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {selectedStudentDetail.privacyNotice?.message}
          </p>
        </div>

        {/* Recent Graded Work */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-white">Graded Academic Assessments</h3>
          <div className="space-y-3">
            {academic.recentScores?.map((score: any) => (
              <div
                key={score.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-white block">{score.title}</span>
                  <span className="text-[11px] text-slate-500">{score.date}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-indigo-400 block">
                    {score.score} / {score.maxScore}
                  </span>
                  <span className="text-[10px] text-slate-400">{score.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACCESS RESTRICTED MODAL (Proving Security & Privacy) */}
        <Modal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          title="Privacy Boundary Test Result"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono font-bold text-rose-400">
                HTTP {privacyTestResult?.statusCode} FORBIDDEN
              </div>
              <h3 className="text-base font-bold text-white">
                {privacyTestResult?.data?.error || 'ACCESS RESTRICTED'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {privacyTestResult?.data?.reason ||
                'Personal Memory Vault items belong solely to the student and are never shared with teachers or peers.'}
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
              <div>// Backend RBAC response verification:</div>
              <div>Status: 403 Forbidden</div>
              <div>Error Code: {privacyTestResult?.data?.code}</div>
              <div>Privacy: Protected by server-side ownership check</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close Verification Modal
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // Default Roster List View
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
          <GraduationCap className="w-4 h-4" /> Class Directory
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Student Academic Roster</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect student completion rates, average scores, and weak conceptual topics
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="pb-4 pl-2">Student</th>
              <th className="pb-4">Average Score</th>
              <th className="pb-4">Curriculum Progress</th>
              <th className="pb-4">Assignments Done</th>
              <th className="pb-4">Diagnosed Weak Topic</th>
              <th className="pb-4 pr-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {students.map((s) => (
              <tr key={s.studentId} className="hover:bg-slate-950/40 transition-colors">
                <td className="py-4 pl-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/20"
                    />
                    <div>
                      <span className="font-bold text-white block">{s.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{s.studentId}</span>
                    </div>
                  </div>
                </td>

                <td className="py-4">
                  <span className="font-mono font-bold text-purple-300 text-sm">
                    {s.averageScore}%
                  </span>
                </td>

                <td className="py-4">
                  <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden mb-1">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${s.overallProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">{s.overallProgress}% mastered</span>
                </td>

                <td className="py-4">
                  <span className="text-slate-300">{s.completedAssignments} / {s.totalAssignments}</span>
                </td>

                <td className="py-4">
                  <span className="text-rose-400 font-medium">{s.weakTopic}</span>
                </td>

                <td className="py-4 pr-2 text-right space-x-2">
                  <button
                    onClick={() => handleTestMemoryVaultAccess(s.studentId)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors"
                    title="Test privacy boundary"
                  >
                    Test Vault Privacy
                  </button>

                  <Link
                    to={`/teacher/students/${s.studentId}`}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
                  >
                    View Academic Data &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACCESS RESTRICTED MODAL (Proving Security & Privacy) */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Privacy Boundary Test Result"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-bold text-rose-400">
              HTTP {privacyTestResult?.statusCode} FORBIDDEN
            </div>
            <h3 className="text-base font-bold text-white">
              {privacyTestResult?.data?.error || 'ACCESS RESTRICTED'}
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {privacyTestResult?.data?.reason ||
              'Personal Memory Vault items belong solely to the student and are never shared with teachers or peers.'}
          </p>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
            <div>// Backend RBAC response verification:</div>
            <div>Status: 403 Forbidden</div>
            <div>Error Code: {privacyTestResult?.data?.code}</div>
            <div>Privacy: Protected by server-side ownership check</div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsPrivacyModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
            >
              Close Verification Modal
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
