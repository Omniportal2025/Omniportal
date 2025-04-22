import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface TicketContextType {
  newTicketsCount: number;
  inProgressTicketsCount: number;
}

const TicketContext = createContext<TicketContextType>({ newTicketsCount: 0, inProgressTicketsCount: 0 });

export const useTicket = () => useContext(TicketContext);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [newTicketsCount, setNewTicketsCount] = useState(0);
  const [inProgressTicketsCount, setInProgressTicketsCount] = useState(0);

  useEffect(() => {
    fetchNewTicketsCount();
    fetchInProgressTicketsCount();
    setupRealtimeSubscription();
  }, []);

  const fetchNewTicketsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('Tickets')
        .select('id', { count: 'exact' })
        .eq('Status', 'new');

      if (error) throw error;
      setNewTicketsCount(data.length);
    } catch (error) {
      console.error('Error fetching new tickets:', error);
    }
  };

  const fetchInProgressTicketsCount = async () => {
    try {
      const { data, error } = await supabase
        .from('Tickets')
        .select('id', { count: 'exact' })
        .in('Status', ['in_progress', 'in progress']);

      if (error) throw error;
      setInProgressTicketsCount(data.length);
    } catch (error) {
      console.error('Error fetching in-progress tickets:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('ticket-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Tickets'
        },
        () => {
          fetchNewTicketsCount();
          fetchInProgressTicketsCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return (
    <TicketContext.Provider value={{ newTicketsCount, inProgressTicketsCount }}>
      {children}
    </TicketContext.Provider>
  );
};
