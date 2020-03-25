import { TestBed } from '@angular/core/testing';

import { TorrentServiceService } from './torrent-service.service';

describe('TorrentServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TorrentServiceService = TestBed.get(TorrentServiceService);
    expect(service).toBeTruthy();
  });
});
