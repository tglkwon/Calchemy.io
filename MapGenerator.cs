using System.Collections.Generic;
using UnityEngine;
using System.Linq;

// 방의 종류를 정의합니다.
public enum RoomType
{
    Monster,
    Elite,
    Shop,
    Rest,
    Treasure,
    Event,
    Boss,
    None // 아직 정해지지 않음
}

// 맵의 각 노드(방) 정보를 담는 클래스입니다.
[System.Serializable]
public class MapNode
{
    public int x, y; // 그리드 좌표
    public Vector2 position; // 월드 좌표
    public RoomType roomType;
    public List<MapNode> incoming = new List<MapNode>(); // 위층(부모)에서 연결된 방들
    public List<MapNode> outgoing = new List<MapNode>(); // 아래층(자식)으로 연결되는 방들

    public MapNode(int x, int y, Vector2 position)
    {
        this.x = x;
        this.y = y;
        this.position = position;
        this.roomType = RoomType.None;
    }
}

public class MapGenerator : MonoBehaviour
{
    [Header("Map Settings")]
    public int mapWidth = 7;   // 가로 크기 (Lane)
    public int mapHeight = 15; // 세로 크기 (Floor)
    public int pathCount = 6;  // 생성할 경로의 개수 (시작점의 개수)
    
    [Header("Display Settings")]
    public float xSpacing = 2.0f; // 방 사이의 가로 간격
    public float ySpacing = 1.5f; // 방 사이의 세로 간격
    public float jitter = 0.5f;   // 방 위치를 약간 불규칙하게 만들어서 자연스럽게 함

    // 생성된 노드들을 저장할 리스트
    public List<MapNode> nodes = new List<MapNode>();
    private MapNode bossNode;

    private void Start()
    {
        GenerateMap();
    }

    // 맵 생성 메인 함수
    [ContextMenu("Generate Map")]
    public void GenerateMap()
    {
        nodes.Clear();
        
        // 1. 경로 생성 (뼈대 만들기)
        List<List<MapNode>> grid = CreatePaths();

        // 2. 연결 정리 (부모가 없는 고아 노드 제거 등)
        PruneIsolatedNodes(grid);

        // 3. 보스 방 추가 (최상단)
        CreateBossNode(grid);

        // 4. 방 종류 배정 (규칙 적용)
        AssignRoomTypes();
    }

    // 1단계: 탐험가(Walker)를 보내 경로를 생성하는 함수
    private List<List<MapNode>> CreatePaths()
    {
        // 그리드 초기화 (아직 노드는 없음, null로 채움)
        List<List<MapNode>> grid = new List<List<MapNode>>();
        for (int y = 0; y < mapHeight; y++)
        {
            List<MapNode> row = new List<MapNode>(new MapNode[mapWidth]);
            grid.Add(row);
        }

        // 지정된 경로 개수만큼 탐험가 출발
        for (int i = 0; i < pathCount; i++)
        {
            // 1층(y=0)에서 랜덤한 시작 위치 결정
            int startX = Random.Range(0, mapWidth);
            int currentX = startX;

            // 1층부터 꼭대기 층까지 올라감
            for (int y = 0; y < mapHeight; y++)
            {
                // 해당 위치에 노드가 없으면 새로 생성
                if (grid[y][currentX] == null)
                {
                    // 위치에 약간의 랜덤성(Jitter)을 줘서 자연스럽게 배치
                    // 옵션 A: y=0이 상단, 실제 좌표는 (mapHeight - y)로 반전하여 아래로 흐르게 함
                    float randomX = (currentX * xSpacing) + Random.Range(-jitter, jitter);
                    float randomY = ((mapHeight - y) * ySpacing) + Random.Range(-jitter, jitter);
                    Vector2 pos = new Vector2(randomX, randomY);

                    MapNode newNode = new MapNode(currentX, y, pos);
                    grid[y][currentX] = newNode;
                    nodes.Add(newNode);
                }

                MapNode currentNode = grid[y][currentX];

                // 마지막 층이 아니라면 다음 층으로 이동할 경로 결정
                if (y < mapHeight - 1)
                {
                    // 다음 이동할 x좌표 결정 (왼쪽, 중앙, 오른쪽 중 하나)
                    int nextX = GetNextPathX(currentX);
                    
                    // 아직 다음 층 노드가 생성 안 됐으면 생성 (여기선 미리 연결을 위해 가상의 타겟을 잡음)
                    // 실제 연결은 다음 루프나 별도 패스에서 처리할 수도 있지만, 
                    // 여기서는 다음 층 루프 돌 때 연결 정보를 갱신하는 방식 대신,
                    // 간단하게 경로를 따라가며 좌표만 결정하고 나중에 연결하는 방식을 씁니다.
                    
                    // *중요*: 여기서는 경로의 '좌표'만 결정하며 올라갑니다. 
                    // 실제 노드 간의 연결(Edge)은 아래에서 후처리로 연결합니다.
                    currentX = nextX; 
                }
            }
        }

        // 생성된 노드들을 기반으로 부모-자식 연결 (Edge 생성)
        ConnectNodes(grid);

        return grid;
    }

    // 다음 층의 X 좌표를 결정 (왼쪽, 유지, 오른쪽)
    private int GetNextPathX(int currentX)
    {
        List<int> candidates = new List<int>();
        
        // 왼쪽으로 갈 수 있는가?
        if (currentX > 0) candidates.Add(currentX - 1);
        // 그대로 갈 수 있는가?
        candidates.Add(currentX);
        // 오른쪽으로 갈 수 있는가?
        if (currentX < mapWidth - 1) candidates.Add(currentX + 1);

        return candidates[Random.Range(0, candidates.Count)];
    }

    // 노드들 간의 연결선(Edge)을 만듭니다.
    private void ConnectNodes(List<List<MapNode>> grid)
    {
        for (int y = 0; y < mapHeight - 1; y++)
        {
            for (int x = 0; x < mapWidth; x++)
            {
                MapNode node = grid[y][x];
                if (node == null) continue;

                // 바로 아래, 왼쪽 아래, 오른쪽 아래를 검사해서 노드가 있다면 연결
                // 슬더스는 경로가 겹치면 합쳐지므로, 여기서는 인접한 아래층 노드들을 찾아서 연결합니다.
                // *주의*: 실제 슬더스는 Path를 따라가며 연결하지만, 
                // 여기서는 간단하게 '가까운 아래층 노드'와 연결하여 교차를 자연스럽게 만듭니다.

                List<MapNode> potentialParents = new List<MapNode>();

                // 왼쪽 위
                if (x > 0 && grid[y + 1][x - 1] != null) potentialParents.Add(grid[y + 1][x - 1]);
                // 바로 위
                if (grid[y + 1][x] != null) potentialParents.Add(grid[y + 1][x]);
                // 오른쪽 위
                if (x < mapWidth - 1 && grid[y + 1][x + 1] != null) potentialParents.Add(grid[y + 1][x + 1]);

                // 아래층에 연결할 후보가 있다면 그 중 하나 이상을 연결
                if (potentialParents.Count > 0)
                {
                    // 무조건 하나는 연결 (길이 끊기지 않게)
                    MapNode target = potentialParents[Random.Range(0, potentialParents.Count)];
                    Link(node, target);

                    // 확률적으로 다른 노드도 연결 (교차점 생성)
                    foreach (var parent in potentialParents)
                    {
                        if (parent != target && Random.value < 0.2f) // 20% 확률로 추가 연결
                        {
                            Link(node, parent);
                        }
                    }
                }
            }
        }
    }

    // 두 노드를 연결하는 헬퍼 함수
    private void Link(MapNode from, MapNode to)
    {
        if (!from.outgoing.Contains(to)) from.outgoing.Add(to);
        if (!to.incoming.Contains(from)) to.incoming.Add(from);
    }

    // 2단계: 연결되지 않은 노드 정리
    private void PruneIsolatedNodes(List<List<MapNode>> grid)
    {
        // 1층이 아닌데 들어오는 연결(incoming)이 없는 방은 도달 불가능하므로 제거
        // 위에서부터 내려오면서 체크하거나, 리스트를 순회하며 제거
        // 간단하게 nodes 리스트에서 제거
        
        for (int i = nodes.Count - 1; i >= 0; i--)
        {
            MapNode node = nodes[i];
            if (node.y > 0 && node.incoming.Count == 0)
            {
                nodes.RemoveAt(i);
                grid[node.y][node.x] = null; // 그리드에서도 제거
            }
            // 아래층으로 가는 길이 없는 노드도 제거 (마지막 층 제외)
            else if (node.y < mapHeight - 1 && node.outgoing.Count == 0)
            {
                // 들어오는 연결 끊어주기
                foreach (var inc in node.incoming)
                {
                    inc.outgoing.Remove(node);
                }
                nodes.RemoveAt(i);
                grid[node.y][node.x] = null;
            }
        }
    }

    // 3단계: 보스 방 생성
    private void CreateBossNode(List<List<MapNode>> grid)
    {
        // 맵 중앙 하단에 보스 배치
        Vector2 bossPos = new Vector2((mapWidth - 1) * xSpacing / 2f, -ySpacing);
        bossNode = new MapNode(-1, mapHeight, bossPos);
        bossNode.roomType = RoomType.Boss;
        
        // 마지막 층의 모든 노드를 보스 방과 연결
        foreach (var node in nodes)
        {
            if (node.y == mapHeight - 1)
            {
                Link(node, bossNode);
            }
        }
        nodes.Add(bossNode);
    }

    // 4단계: 방 종류 배정 (규칙 적용)
    private void AssignRoomTypes()
    {
        foreach (var node in nodes)
        {
            if (node.roomType == RoomType.Boss) continue; // 보스는 이미 설정됨

            // 규칙 1: 1층은 항상 몬스터
            if (node.y == 0)
            {
                node.roomType = RoomType.Monster;
            }
            // 규칙 2: 보스 바로 전 층(14층)은 휴식
            else if (node.y == mapHeight - 1)
            {
                node.roomType = RoomType.Rest;
            }
            // 규칙 3: 9층은 보물 상자 (중간 보상)
            else if (node.y == 8)
            {
                node.roomType = RoomType.Treasure;
            }
            // 그 외 층: 확률 기반 배정
            else
            {
                float roll = Random.value;
                
                // 엘리트 등장 제한: 6층 이상부터 등장 가능
                bool canSpawnElite = (node.y >= 5); 

                if (canSpawnElite && roll < 0.15f) // 15% 엘리트
                {
                    node.roomType = RoomType.Elite;
                }
                else if (roll < 0.3f) // 15% 상점
                {
                    node.roomType = RoomType.Shop;
                }
                else if (roll < 0.55f) // 25% 이벤트
                {
                    node.roomType = RoomType.Event;
                }
                else // 나머지 45% 일반 몬스터
                {
                    node.roomType = RoomType.Monster;
                }
            }
        }
    }

    // 에디터 상에서 맵을 시각적으로 보여주는 함수
    private void OnDrawGizmos()
    {
        if (nodes == null) return;

        foreach (var node in nodes)
        {
            // 노드 그리기 (방 종류에 따라 색상 변경)
            Gizmos.color = GetColorByType(node.roomType);
            Gizmos.DrawSphere(transform.position + (Vector3)node.position, 0.3f);

            // 연결선 그리기
            Gizmos.color = Color.white;
            foreach (var nextNode in node.outgoing)
            {
                Gizmos.DrawLine(transform.position + (Vector3)node.position, transform.position + (Vector3)nextNode.position);
            }
        }
    }

    private Color GetColorByType(RoomType type)
    {
        switch (type)
        {
            case RoomType.Monster: return Color.gray;
            case RoomType.Elite: return Color.red;
            case RoomType.Shop: return Color.yellow;
            case RoomType.Rest: return Color.green;
            case RoomType.Treasure: return Color.cyan;
            case RoomType.Event: return Color.blue;
            case RoomType.Boss: return Color.black;
            default: return Color.white;
        }
    }
}