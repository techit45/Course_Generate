// Comprehensive Logging Service for GenCouce
// Supports multiple logging destinations and structured logging

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  error?: Error;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableLocalStorage: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxLocalStorageEntries: number;
  componentFilters?: string[];
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: 'info',
  enableConsole: true,
  enableLocalStorage: true,
  enableRemote: false,
  maxLocalStorageEntries: 100,
  componentFilters: []
};

// Log level priorities for filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4
};

export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private sessionId: string;

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    
    // Initialize logger
    this.log('info', 'Logger', 'Logger initialized', { config: this.config });
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if log level should be processed
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  // Check if component should be logged
  private shouldLogComponent(component: string): boolean {
    if (this.config.componentFilters && this.config.componentFilters.length > 0) {
      return this.config.componentFilters.some(filter => 
        component.toLowerCase().includes(filter.toLowerCase())
      );
    }
    return true;
  }

  // Create structured log entry
  private createLogEntry(
    level: LogLevel,
    component: string,
    message: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      component,
      message,
      data,
      sessionId: this.sessionId,
      userId: this.getCurrentUserId(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      error
    };
  }

  // Get current user ID (placeholder for user session management)
  private getCurrentUserId(): string | undefined {
    // In a real implementation, this would get the current user ID from session/auth
    return typeof window !== 'undefined' ? 
      localStorage.getItem('userId') || undefined : undefined;
  }

  // Main logging method
  log(
    level: LogLevel,
    component: string,
    message: string,
    data?: any,
    error?: Error
  ): void {
    if (!this.shouldLog(level) || !this.shouldLogComponent(component)) {
      return;
    }

    const logEntry = this.createLogEntry(level, component, message, data, error);

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Local storage logging
    if (this.config.enableLocalStorage) {
      this.logToLocalStorage(logEntry);
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.logToRemote(logEntry);
    }
  }

  // Console logging with formatting
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.component}]`;
    
    const logMethod = this.getConsoleMethod(entry.level);
    
    if (entry.data || entry.error) {
      logMethod.call(console, `${prefix} ${entry.message}`, {
        data: entry.data,
        error: entry.error,
        sessionId: entry.sessionId,
        userId: entry.userId,
        url: entry.url
      });
    } else {
      logMethod.call(console, `${prefix} ${entry.message}`);
    }
  }

  // Get appropriate console method for log level
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case 'debug': return console.debug;
      case 'info': return console.info;
      case 'warn': return console.warn;
      case 'error':
      case 'critical': return console.error;
      default: return console.log;
    }
  }

  // Local storage logging
  private logToLocalStorage(entry: LogEntry): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const key = 'gencouce_logs';
      const existingLogs = localStorage.getItem(key);
      let logs: LogEntry[] = existingLogs ? JSON.parse(existingLogs) : [];

      // Add new entry
      logs.push({
        ...entry,
        timestamp: entry.timestamp.toISOString() // Serialize date
      } as any);

      // Limit storage size
      if (logs.length > this.config.maxLocalStorageEntries) {
        logs = logs.slice(-this.config.maxLocalStorageEntries);
      }

      localStorage.setItem(key, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log to localStorage:', error);
    }
  }

  // Remote logging
  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...entry,
          timestamp: entry.timestamp.toISOString(),
          error: entry.error ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack
          } : undefined
        })
      });
    } catch (error) {
      console.error('Failed to log to remote endpoint:', error);
      // Store failed remote logs locally for retry
      this.logToLocalStorage({
        ...entry,
        component: 'Logger',
        message: 'Failed to send remote log',
        data: { originalEntry: entry, remoteError: error }
      } as LogEntry);
    }
  }

  // Convenience methods
  debug(component: string, message: string, data?: any): void {
    this.log('debug', component, message, data);
  }

  info(component: string, message: string, data?: any): void {
    this.log('info', component, message, data);
  }

  warn(component: string, message: string, data?: any): void {
    this.log('warn', component, message, data);
  }

  error(component: string, message: string, data?: any, error?: Error): void {
    this.log('error', component, message, data, error);
  }

  critical(component: string, message: string, data?: any, error?: Error): void {
    this.log('critical', component, message, data, error);
  }

  // Performance logging
  time(label: string): void {
    if (typeof console.time === 'function') {
      console.time(label);
    }
  }

  timeEnd(component: string, label: string, data?: any): void {
    if (typeof console.timeEnd === 'function') {
      console.timeEnd(label);
    }
    this.info(component, `Performance: ${label} completed`, data);
  }

  // User action logging
  logUserAction(component: string, action: string, data?: any): void {
    this.info(component, `User action: ${action}`, {
      type: 'user_action',
      action,
      ...data
    });
  }

  // API call logging
  logAPICall(
    component: string,
    method: string,
    url: string,
    status: number,
    duration?: number,
    data?: any
  ): void {
    const level: LogLevel = status >= 400 ? 'error' : 'info';
    this.log(level, component, `API ${method} ${url}`, {
      type: 'api_call',
      method,
      url,
      status,
      duration,
      ...data
    });
  }

  // Error boundary logging
  logErrorBoundary(component: string, error: Error, errorInfo: any): void {
    this.critical(component, 'React Error Boundary triggered', {
      type: 'react_error_boundary',
      errorInfo
    }, error);
  }

  // Get logs from local storage
  getStoredLogs(): LogEntry[] {
    if (typeof localStorage === 'undefined') return [];

    try {
      const logs = localStorage.getItem('gencouce_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to retrieve stored logs:', error);
      return [];
    }
  }

  // Clear stored logs
  clearStoredLogs(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('gencouce_logs');
    }
  }

  // Export logs for debugging
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getStoredLogs();
    
    if (format === 'csv') {
      const headers = ['timestamp', 'level', 'component', 'message', 'sessionId', 'userId', 'url'];
      const csvLines = [
        headers.join(','),
        ...logs.map(log => headers.map(header => 
          JSON.stringify((log as any)[header] || '')
        ).join(','))
      ];
      return csvLines.join('\n');
    }
    
    return JSON.stringify(logs, null, 2);
  }

  // Update configuration
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.info('Logger', 'Configuration updated', { newConfig });
  }

  // Get current configuration
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Get session information
  getSessionInfo(): { sessionId: string; userId?: string } {
    return {
      sessionId: this.sessionId,
      userId: this.getCurrentUserId()
    };
  }
}

// Create and export default logger instance
export const logger = Logger.getInstance({
  minLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  enableConsole: true,
  enableLocalStorage: true,
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.NEXT_PUBLIC_LOGGING_ENDPOINT,
  maxLocalStorageEntries: 200
});

// Export logger for use in error handler
export default logger;