import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

interface Job {
  job_name: string;
  pay_rate: number;
}

interface JobContextType {
  jobs: Job[];
  selectedJob: Job | null;
  setSelectedJob: (job: Job) => void;
  loadJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJobState] = useState<Job | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadJobs();
    } else {
      setJobs([]);
      setSelectedJobState(null);
    }
  }, [currentUser]);

  const loadJobs = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('user_jobs')
        .select('job_name, pay_rate')
        .eq('user_name', currentUser)
        .order('job_name');

      if (error) {
        console.error('Error loading jobs:', error);
        return;
      }

      if (data && data.length > 0) {
        setJobs(data);
        
        // Load saved selected job from localStorage
        const savedJob = localStorage.getItem(`${currentUser}_selectedJob`);
        if (savedJob) {
          try {
            const parsed = JSON.parse(savedJob);
            // Verify the saved job still exists in the jobs list
            const found = data.find(j => j.job_name === parsed.job_name);
            if (found) {
              setSelectedJobState(found);
              return;
            }
          } catch (e) {
            // Invalid saved job, ignore
          }
        }
        
        // Set first job as default if none selected
        if (!selectedJob) {
          setSelectedJobState(data[0]);
        }
      } else {
        setJobs([]);
        setSelectedJobState(null);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const setSelectedJob = (job: Job) => {
    setSelectedJobState(job);
    if (currentUser) {
      localStorage.setItem(`${currentUser}_selectedJob`, JSON.stringify(job));
    }
  };

  return (
    <JobContext.Provider value={{ jobs, selectedJob, setSelectedJob, loadJobs }}>
      {children}
    </JobContext.Provider>
  );
}

export function useJob() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
}

