import { useState, useEffect } from 'react';
import UserTextBox from './UserTextBox';
import AgentTextBox from './AgentTextBox';
import { Card } from "@/components/ui/card"; 
import axios from 'axios';
import { useWorkflow } from '@/context/WorkflowContext';  // Import the context hook
import { usePathname } from 'next/navigation';  // Import usePathname for routing

type Message = {
  position: 'left' | 'right';
  text: string;
};

type VoiceflowRequest = {
  type: string;
  payload?: string;
};

type VoiceFlowChatProps = {
  onRelevantVarsChange: (vars: string[]) => void;
};


const VoiceFlowChat: React.FC<VoiceFlowChatProps> = ({ onRelevantVarsChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [dataLoaded, setDataLoaded] = useState<boolean>(true);
  const [readyToStart, setReadyToStart] = useState<boolean>(false);
  const [sessionEnded, setSessionEnded] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false); // Track AI processing
  const api_key = process.env.NEXT_PUBLIC_API_KEY;
  const user_id = 'ADNOCDemo1';

  // Access the currentPrompt from the WorkflowContext
  const { currentPrompt } = useWorkflow();

    // Access the current page route using usePathname
    const pathname = usePathname();

    // Determine liveData based on the current page
    const liveDataMapping: Record<string, string> = {
      '/PageAgentDefinitions': 'AgentDefinitions',
      '/PageWorkflows': 'Workflows',
      '/PageConstraints': 'Constraints',
      '/PageNetworkSettings': 'NetworkSettings',
      '/PageRecommendations': 'RLARecommendations',
      '/PageAlerts': 'RLAAlerts',
    };

    const liveData = liveDataMapping[pathname] || 'defaultData'; // Fallback to defaultData if no match


  const interact = async (request: VoiceflowRequest) => {
    try {
      const res = await axios.post(
        https://general-runtime.voiceflow.com/state/user/${user_id}/interact,
        { request },
        {
          headers: {
            Authorization: api_key,
            versionID: 'development',
            accept: 'application/json',
            'content-type': 'application/json',
          },
        }
      );
      const traces = res.data;
      let responseText = '';
      let relevantVariablesList: string[] = [];

      const relevantVarsRegex = /<relevant-vars>(.*?)<\/relevant-vars>/;

      for (let trace of traces) {
        if (trace.type === 'text' && trace.payload?.message) {
          const match = trace.payload.message.match(relevantVarsRegex);
          if (match) {
            relevantVariablesList = match[1].split(' ').map((varName: string) => varName.trim());
            onRelevantVarsChange(relevantVariablesList); 
          } else {
            responseText += trace.payload.message + '\n';
          }
        }
        if (trace.type === 'end') {
          setSessionEnded(true);
          return;
        }
      }

      setMessages(prevMessages => [
        ...prevMessages,
        { position: 'left', text: responseText }
      ]);
      setIsThinking(false);  // Stop the pulsating effect and "thinking" note

    } catch (error) {
      console.error('Error interacting with Voiceflow:', error);
      setIsThinking(false);  // Ensure "thinking" stops even on error
    }
  };

  const handleSendQuery = async (userInput: string) => {
    // Update user messages and start "thinking"
    setMessages(prevMessages => [
      ...prevMessages,
      { position: 'right', text: userInput }
    ]);
    setIsThinking(true);  // Start pulsating and show "thinking" note

    await interact({ type: 'text', payload: userInput });
  };

  useEffect(() => {
    if (dataLoaded && !sessionEnded) {
      setReadyToStart(true);
    }
  }, [dataLoaded, sessionEnded]);

  useEffect(() => {
    if (readyToStart) {
      const startConversation = async () => {
        await interact({ type: 'launch' });
        await interact({ type: 'text', payload: JSON.stringify(liveData) });
        setReadyToStart(false);
      };
      startConversation();
    }
  }, [readyToStart]);

  return (
    <div className="flex flex-col space-y-4">
      <Card className="p-4 bg-[#03091b] text-white">
        {/* Pass the current prompt to UserTextBox as a default input */}
        <UserTextBox onSendQuery={handleSendQuery} sessionEnded={sessionEnded} defaultPrompt={currentPrompt} />
      </Card>
      <Card className="p-4 bg-[#03091b] text-white">
        <AgentTextBox messages={messages} isThinking={isThinking} />
      </Card>
    </div>
  );
};

export default VoiceFlowChat;