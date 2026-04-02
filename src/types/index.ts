export interface Log {
  id: number;
  timestamp: string;
  level: string;
  message: string;
}

export interface CrawlerStatus {
  status: 'idle' | 'running' | 'stopping' | 'error';
}

export interface CrawlerStartRequest {
  platform: string;
  crawler_type: string;
  login_type: string;
  save_option: string;
  keywords?: string;
  sort_type?: string;
  specified_ids?: string;
  creator_ids?: string;
  enable_comments?: boolean;
  enable_sub_comments?: boolean;
  headless?: boolean;
  cdp?: boolean;
  cdp_headless?: boolean;
  start_page?: number;
  max_notes?: number;
  concurrency?: number;
  enable_media?: boolean;
  max_comments?: number;
  wordcloud?: boolean;
}

export interface Note {
  id?: string;
  note_id?: string;
  aweme_id?: string;
  aid?: string;
  title?: string;
  desc?: string;
  note_title?: string;
  note_desc?: string;
  content?: string;
  nickname?: string;
  user?: { nickname: string };
  author?: string;
  liked_count?: number;
  like_count?: number;
  digg_count?: number;
  comment_count?: number;
  comments_count?: number;
  time?: number | string;
  create_time?: number | string;
  add_ts?: number | string;
  note_url?: string;
}

export interface Comment {
  note_id?: string;
  aweme_id?: string;
  video_id?: string;
  nickname?: string;
  user_nickname?: string;
  commenter?: string;
  content?: string;
  text?: string;
  comment_content?: string;
  like_count?: number;
  digg_count?: number;
  liked_count?: number;
  create_time?: number | string;
  time?: number | string;
  add_ts?: number | string;
}

export interface Clue {
  id: number;
  clue_no: string;
  clue_title: string;
  clue_desc: string;
  target_user_id: string;
  source_type: string;
  source_keyword: string;
  hit_rule_code: string;
  hit_rule_name: string;
  suspicious_reason: string;
  evidence_summary: string;
  risk_level: number;
  status: number;
  handler: string;
  handle_result: string;
  create_time: number;
  update_time: number;
}

export interface ClueNoteRel {
  note_id: string;
  relation_type: string;
  evidence_flag: number;
  remark: string;
}

export interface ClueCommentRel {
  comment_id: string;
  note_id: string;
  relation_type: string;
  evidence_flag: number;
  remark: string;
}

export interface ClueDetail extends Clue {
  notes: ClueNoteRel[];
  comments: ClueCommentRel[];
}
